"""Telegram alert module for trade notifications and drawdown warnings."""

from __future__ import annotations

import asyncio
import logging

import aiohttp

from polymarket_arb.config import Config
from polymarket_arb.modules.executor import Trade

logger = logging.getLogger(__name__)


class TelegramAlerter:
    """Sends trade alerts and risk warnings via Telegram Bot API."""

    def __init__(self, config: Config) -> None:
        self._token = config.telegram_bot_token
        self._chat_id = config.telegram_chat_id
        self._enabled = bool(self._token and self._chat_id)
        self._session: aiohttp.ClientSession | None = None
        self._send_lock = asyncio.Lock()

        if not self._enabled:
            logger.info("Telegram alerts disabled (missing token or chat_id)")

    async def start(self) -> None:
        if self._enabled:
            self._session = aiohttp.ClientSession()
            logger.info("Telegram alerter started")

    async def stop(self) -> None:
        if self._session:
            await self._session.close()
            self._session = None

    async def send_trade_opened(self, trade: Trade) -> None:
        """Alert on trade entry."""
        mode = "PAPER" if trade.is_paper else "LIVE"
        msg = (
            f"{'[PAPER] ' if trade.is_paper else ''}Trade Opened\n"
            f"{'=' * 30}\n"
            f"Market: {trade.signal_label}\n"
            f"Direction: {trade.direction}\n"
            f"Size: ${trade.size_usd:.2f}\n"
            f"Entry: {trade.entry_price:.4f}\n"
            f"Edge: {trade.edge_pct:.1f}%\n"
            f"Confidence: {trade.confidence:.0f}%\n"
            f"Kelly: {trade.kelly_fraction:.2%}\n"
            f"CEX Price: ${trade.cex_price_at_entry:,.2f}\n"
            f"Mode: {mode}"
        )
        await self._send(msg)

    async def send_trade_closed(self, trade: Trade) -> None:
        """Alert on trade exit."""
        emoji = "+" if trade.pnl >= 0 else ""
        msg = (
            f"{'[PAPER] ' if trade.is_paper else ''}Trade Closed\n"
            f"{'=' * 30}\n"
            f"Market: {trade.signal_label}\n"
            f"Direction: {trade.direction}\n"
            f"Entry: {trade.entry_price:.4f}\n"
            f"Exit: {trade.exit_price:.4f}\n"
            f"PnL: {emoji}${trade.pnl:.2f}\n"
            f"Result: {'WIN' if trade.is_winner else 'LOSS'}"
        )
        await self._send(msg)

    async def send_drawdown_alert(self, message: str) -> None:
        """Send drawdown threshold warning."""
        msg = f"DRAWDOWN WARNING\n{'=' * 30}\n{message}"
        await self._send(msg)

    async def send_kill_switch(self, reason: str) -> None:
        """Alert that kill switch has been activated."""
        msg = (
            f"KILL SWITCH ACTIVATED\n"
            f"{'=' * 30}\n"
            f"Reason: {reason}\n"
            f"All trading HALTED"
        )
        await self._send(msg)

    async def send_status(self, portfolio_value: float, pnl: float, win_rate: float, open_count: int) -> None:
        """Send periodic status update."""
        msg = (
            f"Status Update\n"
            f"{'=' * 30}\n"
            f"Portfolio: ${portfolio_value:,.2f}\n"
            f"Daily PnL: ${pnl:+,.2f}\n"
            f"Win Rate: {win_rate:.1f}%\n"
            f"Open Positions: {open_count}"
        )
        await self._send(msg)

    async def _send(self, text: str) -> None:
        """Send a message via Telegram Bot API with retry."""
        if not self._enabled or not self._session:
            logger.debug("Telegram alert (not sent): %s", text[:80])
            return

        url = f"https://api.telegram.org/bot{self._token}/sendMessage"
        payload = {
            "chat_id": self._chat_id,
            "text": text,
            "parse_mode": "HTML",
        }

        async with self._send_lock:
            for attempt in range(3):
                try:
                    async with self._session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                        if resp.status == 200:
                            return
                        if resp.status == 429:
                            retry_after = int(resp.headers.get("Retry-After", "5"))
                            logger.warning("Telegram rate limited, waiting %ds", retry_after)
                            await asyncio.sleep(retry_after)
                            continue
                        body = await resp.text()
                        logger.warning("Telegram API error %d: %s", resp.status, body)
                except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                    logger.warning("Telegram send failed (attempt %d): %s", attempt + 1, exc)
                    if attempt < 2:
                        await asyncio.sleep(2 ** attempt)

            logger.error("Failed to send Telegram alert after 3 attempts")
