#!/usr/bin/env python3
"""
Polymarket Latency Arbitrage Bot — Entry Point

Usage:
    python run.py                  # Paper trading (default)
    python run.py --log-level DEBUG

To enable live trading, set ALL THREE environment variables:
    ENABLE_LIVE_TRADING=true
    CONFIRM_LIVE_TRADING=true
    ACCEPT_LIVE_RISK=true
"""

from __future__ import annotations

import argparse
import asyncio
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Polymarket Latency Arbitrage Bot"
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity (default: INFO)",
    )
    args = parser.parse_args()

    # Setup logging before any imports that use it
    from polymarket_arb.bot import ArbBot, setup_logging
    from polymarket_arb.config import Config

    setup_logging(args.log_level)

    config = Config()

    # Safety banner
    print("=" * 60)
    print("  Polymarket Latency Arbitrage Bot")
    print(f"  Mode: {config.mode_label}")
    print("=" * 60)

    if config.is_live:
        print("\n  *** LIVE TRADING IS ENABLED ***")
        print("  Real orders will be placed on Polymarket.")
        print("  Press Ctrl+C to abort.\n")
    else:
        print("\n  Running in PAPER TRADING mode.")
        print("  No real orders will be placed.\n")

    bot = ArbBot(config)

    try:
        asyncio.run(bot.run())
    except KeyboardInterrupt:
        print("\nShutdown requested by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()
