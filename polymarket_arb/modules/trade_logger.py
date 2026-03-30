"""SQLite-based trade logger with full position history."""

from __future__ import annotations

import logging
from pathlib import Path

import aiosqlite

from polymarket_arb.modules.executor import Trade

logger = logging.getLogger(__name__)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS trades (
    trade_id       TEXT PRIMARY KEY,
    signal_label   TEXT NOT NULL,
    asset          TEXT NOT NULL,
    timeframe      TEXT NOT NULL,
    direction      TEXT NOT NULL,
    entry_price    REAL NOT NULL,
    exit_price     REAL,
    size_usd       REAL NOT NULL,
    shares         REAL NOT NULL,
    edge_pct       REAL NOT NULL,
    confidence     REAL NOT NULL,
    kelly_fraction REAL NOT NULL,
    cex_price      REAL NOT NULL,
    model_prob     REAL NOT NULL,
    pnl            REAL DEFAULT 0,
    status         TEXT NOT NULL,
    is_paper       INTEGER NOT NULL,
    opened_at      REAL NOT NULL,
    closed_at      REAL
);

CREATE TABLE IF NOT EXISTS daily_summary (
    date           TEXT PRIMARY KEY,
    starting_value REAL NOT NULL,
    ending_value   REAL NOT NULL,
    pnl            REAL NOT NULL,
    trades_count   INTEGER NOT NULL,
    win_rate       REAL NOT NULL,
    max_drawdown   REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_asset ON trades(asset);
CREATE INDEX IF NOT EXISTS idx_trades_opened ON trades(opened_at);
"""


class TradeLogger:
    """Async SQLite logger for trade history."""

    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path
        self._db: aiosqlite.Connection | None = None

    async def start(self) -> None:
        """Open database and create tables."""
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._db = await aiosqlite.connect(str(self._db_path))
        await self._db.executescript(_SCHEMA)
        await self._db.commit()
        logger.info("Trade logger initialised: %s", self._db_path)

    async def stop(self) -> None:
        """Close database connection."""
        if self._db:
            await self._db.close()
            self._db = None

    async def log_open(self, trade: Trade) -> None:
        """Log a newly opened trade."""
        if self._db is None:
            return
        await self._db.execute(
            """
            INSERT OR REPLACE INTO trades
            (trade_id, signal_label, asset, timeframe, direction,
             entry_price, size_usd, shares, edge_pct, confidence,
             kelly_fraction, cex_price, model_prob, status, is_paper, opened_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                trade.trade_id,
                trade.signal_label,
                trade.asset,
                trade.timeframe,
                trade.direction,
                trade.entry_price,
                trade.size_usd,
                trade.shares,
                trade.edge_pct,
                trade.confidence,
                trade.kelly_fraction,
                trade.cex_price_at_entry,
                trade.model_prob,
                trade.status.value,
                int(trade.is_paper),
                trade.opened_at,
            ),
        )
        await self._db.commit()

    async def log_close(self, trade: Trade) -> None:
        """Update a trade with exit information."""
        if self._db is None:
            return
        await self._db.execute(
            """
            UPDATE trades
            SET exit_price = ?, pnl = ?, status = ?, closed_at = ?
            WHERE trade_id = ?
            """,
            (
                trade.exit_price,
                trade.pnl,
                trade.status.value,
                trade.closed_at,
                trade.trade_id,
            ),
        )
        await self._db.commit()

    async def log_daily_summary(
        self,
        date: str,
        starting_value: float,
        ending_value: float,
        pnl: float,
        trades_count: int,
        win_rate: float,
        max_drawdown: float,
    ) -> None:
        """Log end-of-day summary."""
        if self._db is None:
            return
        await self._db.execute(
            """
            INSERT OR REPLACE INTO daily_summary
            (date, starting_value, ending_value, pnl, trades_count, win_rate, max_drawdown)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (date, starting_value, ending_value, pnl, trades_count, win_rate, max_drawdown),
        )
        await self._db.commit()

    async def get_recent_trades(self, limit: int = 10) -> list[dict]:
        """Fetch most recent trades."""
        if self._db is None:
            return []
        cursor = await self._db.execute(
            """
            SELECT trade_id, signal_label, direction, entry_price, exit_price,
                   size_usd, pnl, status, is_paper, opened_at, closed_at
            FROM trades
            ORDER BY opened_at DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = await cursor.fetchall()
        columns = [d[0] for d in cursor.description]
        return [dict(zip(columns, row)) for row in rows]

    async def get_total_stats(self) -> dict:
        """Get aggregate statistics."""
        if self._db is None:
            return {}
        cursor = await self._db.execute(
            """
            SELECT
                COUNT(*) as total_trades,
                SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN pnl <= 0 THEN 1 ELSE 0 END) as losses,
                SUM(pnl) as total_pnl,
                AVG(pnl) as avg_pnl,
                MAX(pnl) as best_trade,
                MIN(pnl) as worst_trade
            FROM trades WHERE status = 'CLOSED'
            """,
        )
        row = await cursor.fetchone()
        if row is None:
            return {}
        columns = [d[0] for d in cursor.description]
        return dict(zip(columns, row))
