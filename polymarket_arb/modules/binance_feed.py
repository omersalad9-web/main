"""Real-time BTC/ETH price feed via Binance WebSocket."""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field

import websockets
import websockets.exceptions

from polymarket_arb.config import Config

logger = logging.getLogger(__name__)


@dataclass
class PriceSnapshot:
    """Latest price data for a symbol."""

    symbol: str
    price: float
    timestamp: float  # unix epoch
    bid: float = 0.0
    ask: float = 0.0

    @property
    def age_ms(self) -> float:
        return (time.time() - self.timestamp) * 1000


class BinanceFeed:
    """Connects to Binance WebSocket and maintains latest BTC/ETH prices."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._prices: dict[str, PriceSnapshot] = {}
        self._running = False
        self._ws: websockets.WebSocketClientProtocol | None = None
        self._lock = asyncio.Lock()
        self._connected = asyncio.Event()

    @property
    def prices(self) -> dict[str, PriceSnapshot]:
        return dict(self._prices)

    def get_price(self, symbol: str) -> PriceSnapshot | None:
        """Get latest price for symbol (e.g. 'btcusdt')."""
        return self._prices.get(symbol.lower())

    async def start(self) -> None:
        """Start the WebSocket connection with auto-reconnect."""
        self._running = True
        while self._running:
            try:
                await self._connect_and_listen()
            except (
                websockets.exceptions.ConnectionClosed,
                websockets.exceptions.ConnectionClosedError,
                ConnectionError,
                OSError,
            ) as exc:
                if not self._running:
                    break
                logger.warning("Binance WS disconnected: %s. Reconnecting in 2s...", exc)
                self._connected.clear()
                await asyncio.sleep(2)
            except Exception:
                if not self._running:
                    break
                logger.exception("Unexpected Binance WS error. Reconnecting in 5s...")
                self._connected.clear()
                await asyncio.sleep(5)

    async def stop(self) -> None:
        """Gracefully stop the feed."""
        self._running = False
        self._connected.clear()
        if self._ws:
            await self._ws.close()

    async def wait_for_connection(self, timeout: float = 30.0) -> bool:
        """Wait until we have at least one price update."""
        try:
            await asyncio.wait_for(self._connected.wait(), timeout=timeout)
            return True
        except asyncio.TimeoutError:
            logger.error("Timed out waiting for Binance connection")
            return False

    async def _connect_and_listen(self) -> None:
        """Connect to Binance combined stream and process messages."""
        streams = "/".join(
            f"{sym}@bookTicker" for sym in self._config.binance_symbols
        )
        url = f"{self._config.binance_ws_url}/stream?streams={streams}"

        logger.info("Connecting to Binance WS: %s", url)

        async with websockets.connect(
            url,
            ping_interval=20,
            ping_timeout=10,
            close_timeout=5,
        ) as ws:
            self._ws = ws
            logger.info("Binance WS connected")

            async for raw_msg in ws:
                if not self._running:
                    break
                try:
                    msg = json.loads(raw_msg)
                    data = msg.get("data", {})
                    await self._handle_book_ticker(data)
                except (json.JSONDecodeError, KeyError, ValueError) as exc:
                    logger.debug("Malformed Binance message: %s", exc)

    async def _handle_book_ticker(self, data: dict) -> None:
        """Process a bookTicker update."""
        symbol = data.get("s", "").lower()
        if not symbol:
            return

        try:
            bid = float(data["b"])
            ask = float(data["a"])
            mid = (bid + ask) / 2
        except (KeyError, ValueError):
            return

        snapshot = PriceSnapshot(
            symbol=symbol,
            price=mid,
            bid=bid,
            ask=ask,
            timestamp=time.time(),
        )

        async with self._lock:
            self._prices[symbol] = snapshot

        if not self._connected.is_set():
            self._connected.set()
