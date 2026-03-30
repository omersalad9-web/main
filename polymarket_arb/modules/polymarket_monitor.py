"""Polymarket CLOB API monitor for BTC/ETH up/down contracts."""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field

from polymarket_arb.config import Config
from polymarket_arb.utils.rate_limiter import RateLimiter
from polymarket_arb.utils.retry import async_retry

logger = logging.getLogger(__name__)


@dataclass
class MarketSnapshot:
    """Snapshot of a Polymarket binary contract."""

    label: str
    condition_id: str
    yes_price: float  # 0.0 - 1.0  (probability)
    no_price: float
    spread: float
    timestamp: float
    best_bid: float = 0.0
    best_ask: float = 0.0

    @property
    def implied_prob_yes(self) -> float:
        """Implied probability of YES outcome (%)."""
        return self.yes_price * 100

    @property
    def age_ms(self) -> float:
        return (time.time() - self.timestamp) * 1000


class PolymarketMonitor:
    """Polls Polymarket CLOB for order-book snapshots of monitored markets."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._snapshots: dict[str, MarketSnapshot] = {}
        self._running = False
        self._rate_limiter = RateLimiter(config.rate_limit_calls_per_second)
        self._client = None  # lazily initialised
        self._ready = asyncio.Event()

    @property
    def snapshots(self) -> dict[str, MarketSnapshot]:
        return dict(self._snapshots)

    def get_snapshot(self, label: str) -> MarketSnapshot | None:
        return self._snapshots.get(label)

    async def start(self) -> None:
        """Begin polling loop."""
        self._running = True
        self._init_client()
        logger.info("Polymarket monitor started (poll every %.1fs)", self._config.polymarket_poll_interval)

        while self._running:
            try:
                await self._poll_all_markets()
            except Exception:
                logger.exception("Error polling Polymarket markets")
            await asyncio.sleep(self._config.polymarket_poll_interval)

    async def stop(self) -> None:
        self._running = False

    async def wait_for_data(self, timeout: float = 60.0) -> bool:
        try:
            await asyncio.wait_for(self._ready.wait(), timeout=timeout)
            return True
        except asyncio.TimeoutError:
            logger.error("Timed out waiting for Polymarket data")
            return False

    def _init_client(self) -> None:
        """Initialise the py-clob-client ClobClient."""
        try:
            from py_clob_client.client import ClobClient

            self._client = ClobClient(
                self._config.polymarket_host,
                key=self._config.polymarket_api_key or None,
                chain_id=self._config.polymarket_chain_id,
            )
            if self._config.polymarket_api_key:
                self._client.set_api_creds(
                    self._client.create_or_derive_api_creds()
                )
            logger.info("Polymarket CLOB client initialised")
        except ImportError:
            logger.warning(
                "py-clob-client not installed — using simulated market data"
            )
            self._client = None
        except Exception:
            logger.exception("Failed to initialise Polymarket client — using simulated data")
            self._client = None

    async def _poll_all_markets(self) -> None:
        """Fetch order books for all monitored condition IDs."""
        condition_map = self._config.get_all_condition_ids()
        tasks = []
        for label, cid in condition_map.items():
            if cid:
                tasks.append(self._poll_market(label, cid))

        if not tasks:
            # No condition IDs configured — generate simulated snapshots
            await self._generate_simulated_snapshots()
            return

        await asyncio.gather(*tasks, return_exceptions=True)

        if not self._ready.is_set() and self._snapshots:
            self._ready.set()

    @async_retry(max_attempts=3, base_delay=1.0)
    async def _poll_market(self, label: str, condition_id: str) -> None:
        """Fetch a single market's order book."""
        await self._rate_limiter.acquire()

        if self._client is None:
            return

        loop = asyncio.get_running_loop()
        try:
            book = await loop.run_in_executor(
                None, self._client.get_order_book, condition_id
            )
        except Exception as exc:
            logger.warning("Failed to fetch order book for %s: %s", label, exc)
            raise

        bids = book.get("bids", [])
        asks = book.get("asks", [])

        best_bid = float(bids[0]["price"]) if bids else 0.0
        best_ask = float(asks[0]["price"]) if asks else 1.0
        mid = (best_bid + best_ask) / 2 if bids and asks else 0.5

        snapshot = MarketSnapshot(
            label=label,
            condition_id=condition_id,
            yes_price=mid,
            no_price=1.0 - mid,
            spread=best_ask - best_bid,
            best_bid=best_bid,
            best_ask=best_ask,
            timestamp=time.time(),
        )
        self._snapshots[label] = snapshot

    async def _generate_simulated_snapshots(self) -> None:
        """Generate simulated market snapshots when no real condition IDs are set."""
        import random

        labels = [
            "BTC_5M_UP", "BTC_5M_DOWN", "BTC_15M_UP", "BTC_15M_DOWN",
            "ETH_5M_UP", "ETH_5M_DOWN", "ETH_15M_UP", "ETH_15M_DOWN",
        ]
        now = time.time()
        for label in labels:
            existing = self._snapshots.get(label)
            if existing:
                # Random walk from previous price
                delta = random.uniform(-0.03, 0.03)
                yes = max(0.05, min(0.95, existing.yes_price + delta))
            else:
                yes = random.uniform(0.35, 0.65)

            spread = random.uniform(0.01, 0.04)
            self._snapshots[label] = MarketSnapshot(
                label=label,
                condition_id="simulated",
                yes_price=yes,
                no_price=1.0 - yes,
                spread=spread,
                best_bid=max(0.01, yes - spread / 2),
                best_ask=min(0.99, yes + spread / 2),
                timestamp=now,
            )

        if not self._ready.is_set():
            self._ready.set()
