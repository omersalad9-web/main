"""Configuration module with environment-based settings."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    """Central configuration for the arbitrage bot."""

    # --- Polymarket ---
    polymarket_api_key: str = field(
        default_factory=lambda: os.getenv("POLYMARKET_API_KEY", "")
    )
    polymarket_secret: str = field(
        default_factory=lambda: os.getenv("POLYMARKET_SECRET", "")
    )
    polymarket_passphrase: str = field(
        default_factory=lambda: os.getenv("POLYMARKET_PASSPHRASE", "")
    )
    polymarket_host: str = field(
        default_factory=lambda: os.getenv(
            "POLYMARKET_HOST", "https://clob.polymarket.com"
        )
    )
    polymarket_chain_id: int = 137  # Polygon mainnet

    # Contract condition IDs for BTC/ETH up/down markets
    # These must be updated to match active Polymarket markets
    btc_5m_up_condition_id: str = field(
        default_factory=lambda: os.getenv("BTC_5M_UP_CONDITION_ID", "")
    )
    btc_5m_down_condition_id: str = field(
        default_factory=lambda: os.getenv("BTC_5M_DOWN_CONDITION_ID", "")
    )
    btc_15m_up_condition_id: str = field(
        default_factory=lambda: os.getenv("BTC_15M_UP_CONDITION_ID", "")
    )
    btc_15m_down_condition_id: str = field(
        default_factory=lambda: os.getenv("BTC_15M_DOWN_CONDITION_ID", "")
    )
    eth_5m_up_condition_id: str = field(
        default_factory=lambda: os.getenv("ETH_5M_UP_CONDITION_ID", "")
    )
    eth_5m_down_condition_id: str = field(
        default_factory=lambda: os.getenv("ETH_5M_DOWN_CONDITION_ID", "")
    )
    eth_15m_up_condition_id: str = field(
        default_factory=lambda: os.getenv("ETH_15M_UP_CONDITION_ID", "")
    )
    eth_15m_down_condition_id: str = field(
        default_factory=lambda: os.getenv("ETH_15M_DOWN_CONDITION_ID", "")
    )

    # --- Binance ---
    binance_ws_url: str = "wss://stream.binance.com:9443"
    binance_symbols: list[str] = field(
        default_factory=lambda: ["btcusdt", "ethusdt"]
    )

    # --- Trading parameters ---
    min_edge_pct: float = 5.0  # Minimum edge to execute (%)
    lag_threshold_pct: float = 3.0  # Odds lag threshold (%)
    max_position_pct: float = 8.0  # Max position as % of portfolio
    min_confidence: float = 85.0  # Minimum confidence score (%)
    kelly_fraction: float = 0.5  # Half-Kelly
    initial_portfolio_value: float = 10_000.0  # Paper trading starting capital

    # --- Risk management ---
    max_daily_drawdown_pct: float = 20.0  # Kill switch threshold (%)

    # --- Live trading flags (all three required for live mode) ---
    enable_live_trading: bool = field(
        default_factory=lambda: os.getenv("ENABLE_LIVE_TRADING", "").lower() == "true"
    )
    confirm_live_trading: bool = field(
        default_factory=lambda: os.getenv("CONFIRM_LIVE_TRADING", "").lower() == "true"
    )
    accept_live_risk: bool = field(
        default_factory=lambda: os.getenv("ACCEPT_LIVE_RISK", "").lower() == "true"
    )

    # --- Telegram ---
    telegram_bot_token: str = field(
        default_factory=lambda: os.getenv("TELEGRAM_BOT_TOKEN", "")
    )
    telegram_chat_id: str = field(
        default_factory=lambda: os.getenv("TELEGRAM_CHAT_ID", "")
    )

    # --- Database ---
    db_path: Path = field(
        default_factory=lambda: Path(
            os.getenv("DB_PATH", "polymarket_arb/trades.db")
        )
    )

    # --- Polling / retry ---
    polymarket_poll_interval: float = 2.0  # seconds
    retry_max_attempts: int = 5
    retry_base_delay: float = 1.0  # seconds (exponential backoff base)
    rate_limit_calls_per_second: float = 5.0

    @property
    def is_live(self) -> bool:
        """Live trading requires all three flags to be True."""
        return (
            self.enable_live_trading
            and self.confirm_live_trading
            and self.accept_live_risk
        )

    @property
    def mode_label(self) -> str:
        return "LIVE" if self.is_live else "PAPER"

    def get_all_condition_ids(self) -> dict[str, str]:
        """Return mapping of label -> condition_id for all monitored markets."""
        return {
            "BTC_5M_UP": self.btc_5m_up_condition_id,
            "BTC_5M_DOWN": self.btc_5m_down_condition_id,
            "BTC_15M_UP": self.btc_15m_up_condition_id,
            "BTC_15M_DOWN": self.btc_15m_down_condition_id,
            "ETH_5M_UP": self.eth_5m_up_condition_id,
            "ETH_5M_DOWN": self.eth_5m_down_condition_id,
            "ETH_15M_UP": self.eth_15m_up_condition_id,
            "ETH_15M_DOWN": self.eth_15m_down_condition_id,
        }
