"""Arbitrage detection engine with Kelly Criterion position sizing."""

from __future__ import annotations

import logging
import math
import time
from dataclasses import dataclass
from enum import Enum

from polymarket_arb.config import Config
from polymarket_arb.modules.binance_feed import BinanceFeed, PriceSnapshot
from polymarket_arb.modules.polymarket_monitor import MarketSnapshot, PolymarketMonitor

logger = logging.getLogger(__name__)


class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"


@dataclass
class Signal:
    """A detected arbitrage signal."""

    label: str
    asset: str  # BTC or ETH
    timeframe: str  # 5M or 15M
    direction: Direction
    poly_implied_prob: float  # Polymarket implied probability (0-1)
    model_prob: float  # Our estimated probability (0-1)
    edge_pct: float  # Edge in percentage points
    confidence: float  # Confidence score (0-100)
    kelly_fraction: float  # Recommended position size (fraction of bankroll)
    kelly_size_usd: float  # Dollar amount to risk
    cex_price: float  # Current CEX price
    poly_yes_price: float  # Polymarket YES price
    timestamp: float


class ArbitrageEngine:
    """Detects mispricing between Polymarket odds and CEX price movements."""

    # Short-term volatility reference (annualised) — used to estimate
    # the probability that price moves up/down within the contract window.
    _BASE_VOL: dict[str, float] = {"BTC": 0.50, "ETH": 0.65}

    def __init__(
        self,
        config: Config,
        binance: BinanceFeed,
        polymarket: PolymarketMonitor,
    ) -> None:
        self._config = config
        self._binance = binance
        self._polymarket = polymarket
        # Track recent price changes for momentum signal
        self._price_history: dict[str, list[tuple[float, float]]] = {
            "btcusdt": [],
            "ethusdt": [],
        }
        self._max_history = 120  # keep last N ticks

    def scan(self, portfolio_value: float) -> list[Signal]:
        """Scan all markets and return actionable signals."""
        signals: list[Signal] = []

        for label, snapshot in self._polymarket.snapshots.items():
            signal = self._evaluate_market(label, snapshot, portfolio_value)
            if signal is not None:
                signals.append(signal)

        # Sort by edge descending
        signals.sort(key=lambda s: s.edge_pct, reverse=True)
        return signals

    def _evaluate_market(
        self,
        label: str,
        market: MarketSnapshot,
        portfolio_value: float,
    ) -> Signal | None:
        """Evaluate a single market for arbitrage opportunity."""
        parts = label.split("_")
        if len(parts) < 3:
            return None

        asset = parts[0]  # BTC or ETH
        timeframe = parts[1]  # 5M or 15M
        direction_str = parts[2]  # UP or DOWN

        try:
            direction = Direction(direction_str)
        except ValueError:
            return None

        # Get CEX price
        symbol = f"{asset.lower()}usdt"
        price_snap = self._binance.get_price(symbol)
        if price_snap is None or price_snap.age_ms > 5000:
            return None  # stale or missing

        # Update price history
        self._record_price(symbol, price_snap)

        # Estimate true probability using momentum + volatility model
        model_prob = self._estimate_probability(
            symbol, asset, timeframe, direction, price_snap
        )
        if model_prob is None:
            return None

        poly_implied = market.yes_price  # 0-1

        # Calculate edge: how much our model disagrees with the market
        edge = model_prob - poly_implied
        edge_pct = edge * 100

        # Calculate lag: absolute difference
        lag_pct = abs(edge_pct)

        # Confidence: based on data freshness, spread, and edge consistency
        confidence = self._compute_confidence(market, price_snap, edge_pct)

        # Check thresholds
        if lag_pct < self._config.lag_threshold_pct:
            return None
        if edge_pct < self._config.min_edge_pct:
            return None  # Only trade when market underprices our view
        if confidence < self._config.min_confidence:
            return None

        # Kelly Criterion sizing
        kelly_full = self._kelly_criterion(model_prob, poly_implied)
        kelly_half = kelly_full * self._config.kelly_fraction  # half-Kelly
        kelly_half = max(0.0, min(kelly_half, self._config.max_position_pct / 100))

        size_usd = kelly_half * portfolio_value

        # Position size cap check
        if (size_usd / portfolio_value) * 100 > self._config.max_position_pct:
            size_usd = portfolio_value * (self._config.max_position_pct / 100)
            kelly_half = size_usd / portfolio_value

        return Signal(
            label=label,
            asset=asset,
            timeframe=timeframe,
            direction=direction,
            poly_implied_prob=poly_implied,
            model_prob=model_prob,
            edge_pct=edge_pct,
            confidence=confidence,
            kelly_fraction=kelly_half,
            kelly_size_usd=size_usd,
            cex_price=price_snap.price,
            poly_yes_price=market.yes_price,
            timestamp=time.time(),
        )

    def _estimate_probability(
        self,
        symbol: str,
        asset: str,
        timeframe: str,
        direction: Direction,
        price_snap: PriceSnapshot,
    ) -> float | None:
        """
        Estimate probability that price moves in *direction* within *timeframe*.

        Uses short-term momentum (recent price trend) combined with a
        simple volatility-adjusted model.
        """
        history = self._price_history.get(symbol, [])
        if len(history) < 5:
            return None  # need minimum history

        # Compute recent momentum over last N seconds
        window_seconds = 300 if timeframe == "5M" else 900
        now = time.time()
        recent = [(t, p) for t, p in history if now - t <= window_seconds]
        if len(recent) < 3:
            return None

        first_price = recent[0][1]
        last_price = recent[-1][1]
        pct_change = (last_price - first_price) / first_price

        # Annualised vol -> period vol
        ann_vol = self._BASE_VOL.get(asset, 0.55)
        minutes = 5 if timeframe == "5M" else 15
        period_vol = ann_vol * math.sqrt(minutes / (365.25 * 24 * 60))

        # Momentum-adjusted probability via z-score
        z = pct_change / period_vol if period_vol > 0 else 0
        # Simple normal CDF approximation
        base_prob = 0.5 * (1 + math.erf(z / math.sqrt(2)))

        if direction == Direction.DOWN:
            base_prob = 1 - base_prob

        # Clamp to reasonable range
        return max(0.05, min(0.95, base_prob))

    def _compute_confidence(
        self,
        market: MarketSnapshot,
        price_snap: PriceSnapshot,
        edge_pct: float,
    ) -> float:
        """Compute a confidence score 0-100 based on data quality."""
        score = 50.0

        # Freshness bonus (data < 1s old → +20)
        if market.age_ms < 1000 and price_snap.age_ms < 1000:
            score += 20
        elif market.age_ms < 3000 and price_snap.age_ms < 3000:
            score += 10

        # Tight spread bonus
        if market.spread < 0.03:
            score += 15
        elif market.spread < 0.06:
            score += 8

        # Edge magnitude bonus
        if abs(edge_pct) > 10:
            score += 15
        elif abs(edge_pct) > 7:
            score += 10
        elif abs(edge_pct) > 5:
            score += 5

        return min(100.0, max(0.0, score))

    def _kelly_criterion(self, win_prob: float, market_price: float) -> float:
        """
        Full Kelly Criterion for a binary outcome.

        f* = (p * (b + 1) - 1) / b

        where:
          p = estimated win probability
          b = net odds received (payout per $1 risked) = (1 / market_price) - 1
        """
        if market_price <= 0 or market_price >= 1:
            return 0.0

        b = (1.0 / market_price) - 1.0
        if b <= 0:
            return 0.0

        f = (win_prob * (b + 1) - 1) / b
        return max(0.0, f)

    def _record_price(self, symbol: str, snap: PriceSnapshot) -> None:
        """Append to price history ring buffer."""
        history = self._price_history.setdefault(symbol, [])
        history.append((snap.timestamp, snap.price))
        if len(history) > self._max_history:
            self._price_history[symbol] = history[-self._max_history:]
