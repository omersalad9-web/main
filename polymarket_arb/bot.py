"""Main bot orchestrator — ties all modules together."""

from __future__ import annotations

import asyncio
import logging
import signal
import sys

from polymarket_arb.config import Config
from polymarket_arb.modules.arbitrage_engine import ArbitrageEngine
from polymarket_arb.modules.binance_feed import BinanceFeed
from polymarket_arb.modules.dashboard import Dashboard
from polymarket_arb.modules.executor import Executor
from polymarket_arb.modules.polymarket_monitor import PolymarketMonitor
from polymarket_arb.modules.risk_manager import RiskManager
from polymarket_arb.modules.telegram_alerts import TelegramAlerter
from polymarket_arb.modules.trade_logger import TradeLogger

logger = logging.getLogger(__name__)


class ArbBot:
    """Top-level orchestrator for the latency arbitrage bot."""

    def __init__(self, config: Config | None = None) -> None:
        self._config = config or Config()
        self._binance = BinanceFeed(self._config)
        self._polymarket = PolymarketMonitor(self._config)
        self._executor = Executor(self._config)
        self._risk = RiskManager(self._config, self._executor)
        self._engine = ArbitrageEngine(self._config, self._binance, self._polymarket)
        self._logger = TradeLogger(self._config.db_path)
        self._telegram = TelegramAlerter(self._config)
        self._dashboard = Dashboard(
            self._config,
            self._executor,
            self._binance,
            self._polymarket,
            self._risk,
        )
        self._running = False
        self._tasks: list[asyncio.Task] = []

    async def run(self) -> None:
        """Start all components and run the main trading loop."""
        self._running = True
        logger.info(
            "Starting Polymarket Arb Bot in %s mode", self._config.mode_label
        )

        if self._config.is_live:
            logger.warning(
                "LIVE TRADING ENABLED — real orders will be placed on Polymarket"
            )

        # Install signal handlers for graceful shutdown
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, lambda: asyncio.create_task(self.shutdown()))

        # Start sub-systems
        await self._logger.start()
        await self._telegram.start()

        self._tasks = [
            asyncio.create_task(self._binance.start(), name="binance_feed"),
            asyncio.create_task(self._polymarket.start(), name="polymarket_monitor"),
            asyncio.create_task(self._trading_loop(), name="trading_loop"),
            asyncio.create_task(self._dashboard.start(), name="dashboard"),
        ]

        # Wait for all tasks (they run forever until shutdown)
        try:
            await asyncio.gather(*self._tasks)
        except asyncio.CancelledError:
            pass
        finally:
            await self._cleanup()

    async def shutdown(self) -> None:
        """Graceful shutdown of all components."""
        if not self._running:
            return
        self._running = False
        logger.info("Shutting down...")

        # Stop dashboard and feeds first
        await self._dashboard.stop()
        await self._binance.stop()
        await self._polymarket.stop()

        # Cancel all tasks
        for task in self._tasks:
            if not task.done():
                task.cancel()

    async def _cleanup(self) -> None:
        """Final cleanup after shutdown."""
        await self._telegram.stop()
        await self._logger.stop()
        logger.info("Bot stopped cleanly")

    async def _trading_loop(self) -> None:
        """Main trading loop: scan for signals, execute, manage risk."""
        # Wait for data sources to be ready
        logger.info("Waiting for data feeds...")
        binance_ready = asyncio.create_task(self._binance.wait_for_connection())
        poly_ready = asyncio.create_task(self._polymarket.wait_for_data())
        await asyncio.gather(binance_ready, poly_ready)

        if not binance_ready.result() or not poly_ready.result():
            logger.error("Failed to initialise data feeds — aborting")
            await self.shutdown()
            return

        logger.info("Data feeds ready — entering trading loop")

        scan_interval = self._config.polymarket_poll_interval
        status_interval = 300  # Send Telegram status every 5 min
        last_status_time = 0.0

        while self._running:
            try:
                await self._tick()

                # Periodic status update via Telegram
                import time
                now = time.time()
                if now - last_status_time >= status_interval:
                    await self._telegram.send_status(
                        self._executor.portfolio_value,
                        self._executor.daily_pnl,
                        self._executor.win_rate,
                        len(self._executor.open_trades),
                    )
                    last_status_time = now

            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Error in trading loop tick")

            await asyncio.sleep(scan_interval)

    async def _tick(self) -> None:
        """Single iteration of the trading loop."""
        # 1. Risk check
        killed, reason = self._risk.check()
        if killed:
            if reason and not hasattr(self, "_kill_alerted"):
                await self._telegram.send_kill_switch(reason)
                self._kill_alerted = True
            return

        # 2. Drawdown alerts
        for alert in self._risk.get_drawdown_alerts():
            await self._telegram.send_drawdown_alert(alert)

        # 3. Close expired positions
        closed = await self._executor.check_and_close_expired(
            self._polymarket.snapshots
        )
        for trade in closed:
            await self._logger.log_close(trade)
            await self._telegram.send_trade_closed(trade)

        # 4. Scan for new signals
        signals = self._engine.scan(self._executor.portfolio_value)
        self._dashboard.set_signals_count(len(signals))

        # 5. Execute qualifying signals
        for sig in signals:
            trade = await self._executor.execute_signal(sig)
            if trade is not None:
                await self._logger.log_open(trade)
                await self._telegram.send_trade_opened(trade)


def setup_logging(level: str = "INFO") -> None:
    """Configure structured logging."""
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.FileHandler("polymarket_arb/bot.log"),
            logging.StreamHandler(sys.stderr),
        ],
    )
    # Suppress noisy third-party loggers
    logging.getLogger("websockets").setLevel(logging.WARNING)
    logging.getLogger("aiohttp").setLevel(logging.WARNING)
