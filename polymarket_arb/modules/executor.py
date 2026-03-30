"""Trade execution module with paper trading and live trading support."""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum

from polymarket_arb.config import Config
from polymarket_arb.modules.arbitrage_engine import Signal

logger = logging.getLogger(__name__)


class TradeStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


@dataclass
class Trade:
    """Represents a single trade (paper or live)."""

    trade_id: str
    signal_label: str
    asset: str
    timeframe: str
    direction: str
    entry_price: float  # Polymarket YES price at entry
    size_usd: float
    shares: float  # size_usd / entry_price
    edge_pct: float
    confidence: float
    kelly_fraction: float
    cex_price_at_entry: float
    model_prob: float
    is_paper: bool
    status: TradeStatus = TradeStatus.OPEN
    exit_price: float | None = None
    pnl: float = 0.0
    opened_at: float = field(default_factory=time.time)
    closed_at: float | None = None

    @property
    def is_winner(self) -> bool:
        return self.pnl > 0


class Executor:
    """Manages trade execution in paper or live mode."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._open_trades: dict[str, Trade] = {}
        self._closed_trades: list[Trade] = []
        self._portfolio_value: float = config.initial_portfolio_value
        self._starting_value: float = config.initial_portfolio_value
        self._daily_high_water: float = config.initial_portfolio_value
        self._lock = asyncio.Lock()
        self._clob_client = None

        if config.is_live:
            self._init_live_client()

    @property
    def portfolio_value(self) -> float:
        return self._portfolio_value

    @property
    def open_trades(self) -> dict[str, Trade]:
        return dict(self._open_trades)

    @property
    def closed_trades(self) -> list[Trade]:
        return list(self._closed_trades)

    @property
    def total_open_exposure(self) -> float:
        return sum(t.size_usd for t in self._open_trades.values())

    @property
    def daily_pnl(self) -> float:
        return self._portfolio_value - self._starting_value

    @property
    def daily_drawdown_pct(self) -> float:
        if self._daily_high_water <= 0:
            return 0.0
        return ((self._daily_high_water - self._portfolio_value) / self._daily_high_water) * 100

    @property
    def win_rate(self) -> float:
        if not self._closed_trades:
            return 0.0
        winners = sum(1 for t in self._closed_trades if t.is_winner)
        return (winners / len(self._closed_trades)) * 100

    async def execute_signal(self, signal: Signal) -> Trade | None:
        """Execute a trade based on a signal."""
        async with self._lock:
            # Check if we already have an open position for this market
            for trade in self._open_trades.values():
                if trade.signal_label == signal.label:
                    logger.debug("Already have open position for %s", signal.label)
                    return None

            # Check position size limit
            new_exposure = self.total_open_exposure + signal.kelly_size_usd
            if (new_exposure / self._portfolio_value) * 100 > self._config.max_position_pct * 3:
                logger.warning(
                    "Total exposure would exceed limit: $%.2f (%.1f%% of portfolio)",
                    new_exposure,
                    (new_exposure / self._portfolio_value) * 100,
                )
                return None

            is_paper = not self._config.is_live
            trade_id = str(uuid.uuid4())[:12]

            if not is_paper:
                success = await self._place_live_order(signal)
                if not success:
                    return None

            shares = signal.kelly_size_usd / signal.poly_yes_price if signal.poly_yes_price > 0 else 0

            trade = Trade(
                trade_id=trade_id,
                signal_label=signal.label,
                asset=signal.asset,
                timeframe=signal.timeframe,
                direction=signal.direction.value,
                entry_price=signal.poly_yes_price,
                size_usd=signal.kelly_size_usd,
                shares=shares,
                edge_pct=signal.edge_pct,
                confidence=signal.confidence,
                kelly_fraction=signal.kelly_fraction,
                cex_price_at_entry=signal.cex_price,
                model_prob=signal.model_prob,
                is_paper=is_paper,
            )

            self._open_trades[trade_id] = trade
            logger.info(
                "[%s] Opened %s trade: %s | $%.2f @ %.4f | edge=%.1f%% conf=%.0f%%",
                "PAPER" if is_paper else "LIVE",
                signal.direction.value,
                signal.label,
                signal.kelly_size_usd,
                signal.poly_yes_price,
                signal.edge_pct,
                signal.confidence,
            )
            return trade

    async def close_trade(
        self,
        trade_id: str,
        exit_price: float,
        reason: str = "normal",
    ) -> Trade | None:
        """Close an open trade and realise P&L."""
        async with self._lock:
            trade = self._open_trades.pop(trade_id, None)
            if trade is None:
                return None

            # P&L: if we bought YES shares at entry_price and sold at exit_price
            trade.exit_price = exit_price
            trade.pnl = trade.shares * (exit_price - trade.entry_price)
            trade.status = TradeStatus.CLOSED
            trade.closed_at = time.time()

            self._portfolio_value += trade.pnl
            if self._portfolio_value > self._daily_high_water:
                self._daily_high_water = self._portfolio_value

            self._closed_trades.append(trade)

            logger.info(
                "[%s] Closed trade %s (%s): PnL=$%.2f | exit=%.4f | reason=%s",
                "PAPER" if trade.is_paper else "LIVE",
                trade_id,
                trade.signal_label,
                trade.pnl,
                exit_price,
                reason,
            )
            return trade

    async def check_and_close_expired(
        self, current_snapshots: dict[str, object]
    ) -> list[Trade]:
        """Check open trades and close any whose contract window has likely expired."""
        closed = []
        now = time.time()

        for trade_id, trade in list(self._open_trades.items()):
            # Auto-close after the timeframe window
            minutes = 5 if trade.timeframe == "5M" else 15
            age_minutes = (now - trade.opened_at) / 60

            if age_minutes >= minutes:
                # Resolve at current market price or simulated outcome
                snapshot = current_snapshots.get(trade.signal_label)
                if snapshot is not None:
                    exit_price = snapshot.yes_price  # type: ignore[attr-defined]
                else:
                    # Simulate resolution
                    import random
                    exit_price = 1.0 if random.random() < trade.model_prob else 0.0

                result = await self.close_trade(trade_id, exit_price, reason="expired")
                if result:
                    closed.append(result)

        return closed

    def reset_daily(self) -> None:
        """Reset daily tracking (call at start of each trading day)."""
        self._starting_value = self._portfolio_value
        self._daily_high_water = self._portfolio_value

    def _init_live_client(self) -> None:
        """Initialize Polymarket CLOB client for live order placement."""
        try:
            from py_clob_client.client import ClobClient

            self._clob_client = ClobClient(
                self._config.polymarket_host,
                key=self._config.polymarket_api_key,
                chain_id=self._config.polymarket_chain_id,
            )
            self._clob_client.set_api_creds(
                self._clob_client.create_or_derive_api_creds()
            )
            logger.info("Live trading client initialised")
        except Exception:
            logger.exception("Failed to initialise live trading client")
            self._clob_client = None

    async def _place_live_order(self, signal: Signal) -> bool:
        """Place a real order via py-clob-client."""
        if self._clob_client is None:
            logger.error("Live client not available — cannot place order")
            return False

        try:
            from py_clob_client.order import OrderArgs

            loop = asyncio.get_running_loop()
            order_args = OrderArgs(
                price=signal.poly_yes_price,
                size=signal.kelly_size_usd,
                side="BUY",
                token_id=signal.label,
            )
            signed_order = await loop.run_in_executor(
                None, self._clob_client.create_order, order_args
            )
            result = await loop.run_in_executor(
                None, self._clob_client.post_order, signed_order
            )
            logger.info("Live order placed: %s", result)
            return True
        except Exception:
            logger.exception("Failed to place live order for %s", signal.label)
            return False
