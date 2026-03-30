"""Rich terminal dashboard for real-time bot monitoring."""

from __future__ import annotations

import asyncio
import time
from datetime import datetime

from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from polymarket_arb.config import Config
from polymarket_arb.modules.binance_feed import BinanceFeed
from polymarket_arb.modules.executor import Executor
from polymarket_arb.modules.polymarket_monitor import PolymarketMonitor
from polymarket_arb.modules.risk_manager import RiskManager


class Dashboard:
    """Terminal dashboard using Rich Live display."""

    def __init__(
        self,
        config: Config,
        executor: Executor,
        binance: BinanceFeed,
        polymarket: PolymarketMonitor,
        risk_manager: RiskManager,
    ) -> None:
        self._config = config
        self._executor = executor
        self._binance = binance
        self._polymarket = polymarket
        self._risk = risk_manager
        self._console = Console()
        self._running = False
        self._signals_count = 0
        self._start_time = time.time()

    def set_signals_count(self, count: int) -> None:
        self._signals_count = count

    async def start(self) -> None:
        """Run the live dashboard."""
        self._running = True
        self._start_time = time.time()

        with Live(
            self._build_layout(),
            console=self._console,
            refresh_per_second=2,
            screen=True,
        ) as live:
            while self._running:
                live.update(self._build_layout())
                await asyncio.sleep(0.5)

    async def stop(self) -> None:
        self._running = False

    def _build_layout(self) -> Layout:
        """Build the full dashboard layout."""
        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="body"),
            Layout(name="footer", size=3),
        )
        layout["body"].split_row(
            Layout(name="left", ratio=1),
            Layout(name="right", ratio=1),
        )
        layout["left"].split_column(
            Layout(name="portfolio", size=10),
            Layout(name="positions"),
        )
        layout["right"].split_column(
            Layout(name="prices", size=12),
            Layout(name="trades"),
        )

        layout["header"].update(self._header_panel())
        layout["portfolio"].update(self._portfolio_panel())
        layout["positions"].update(self._positions_panel())
        layout["prices"].update(self._prices_panel())
        layout["trades"].update(self._trades_panel())
        layout["footer"].update(self._footer_panel())

        return layout

    def _header_panel(self) -> Panel:
        mode = self._config.mode_label
        color = "red bold" if mode == "LIVE" else "green bold"
        kill_status = "[red bold]KILLED[/]" if self._risk.is_killed else "[green]Active[/]"

        uptime = time.time() - self._start_time
        hours, remainder = divmod(int(uptime), 3600)
        mins, secs = divmod(remainder, 60)

        text = Text.from_markup(
            f"  Polymarket Latency Arbitrage Bot  |  "
            f"Mode: [{color}]{mode}[/]  |  "
            f"Status: {kill_status}  |  "
            f"Uptime: {hours:02d}:{mins:02d}:{secs:02d}  |  "
            f"Signals: {self._signals_count}"
        )
        return Panel(text, style="bold blue")

    def _portfolio_panel(self) -> Panel:
        ex = self._executor
        table = Table(show_header=False, expand=True, box=None, padding=(0, 2))
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="white bold")

        pnl = ex.daily_pnl
        pnl_color = "green" if pnl >= 0 else "red"
        dd = ex.daily_drawdown_pct

        table.add_row("Portfolio Value", f"${ex.portfolio_value:,.2f}")
        table.add_row("Daily P&L", f"[{pnl_color}]${pnl:+,.2f}[/]")
        table.add_row("Win Rate", f"{ex.win_rate:.1f}%")
        table.add_row("Daily Drawdown", f"[{'red' if dd > 10 else 'yellow' if dd > 5 else 'green'}]{dd:.1f}%[/]")
        table.add_row("Open Exposure", f"${ex.total_open_exposure:,.2f}")
        table.add_row("Closed Trades", str(len(ex.closed_trades)))

        return Panel(table, title="Portfolio", border_style="green")

    def _positions_panel(self) -> Panel:
        table = Table(expand=True, box=None)
        table.add_column("Market", style="cyan", no_wrap=True)
        table.add_column("Dir", style="white")
        table.add_column("Size", style="yellow", justify="right")
        table.add_column("Entry", justify="right")
        table.add_column("Edge", justify="right")
        table.add_column("Age", justify="right")

        now = time.time()
        for trade in self._executor.open_trades.values():
            age = now - trade.opened_at
            mins, secs = divmod(int(age), 60)
            table.add_row(
                trade.signal_label,
                trade.direction,
                f"${trade.size_usd:.0f}",
                f"{trade.entry_price:.4f}",
                f"{trade.edge_pct:.1f}%",
                f"{mins}:{secs:02d}",
            )

        if not self._executor.open_trades:
            table.add_row("—", "—", "—", "—", "—", "—")

        return Panel(table, title="Open Positions", border_style="yellow")

    def _prices_panel(self) -> Panel:
        table = Table(expand=True, box=None)
        table.add_column("Source", style="cyan")
        table.add_column("Symbol", style="white")
        table.add_column("Price", style="green bold", justify="right")
        table.add_column("Spread", justify="right")
        table.add_column("Age", justify="right")

        # Binance prices
        for symbol in ["btcusdt", "ethusdt"]:
            snap = self._binance.get_price(symbol)
            if snap:
                table.add_row(
                    "Binance",
                    symbol.upper(),
                    f"${snap.price:,.2f}",
                    f"${snap.ask - snap.bid:.2f}",
                    f"{snap.age_ms:.0f}ms",
                )

        table.add_row("", "", "", "", "")

        # Polymarket snapshots (just show a few)
        for label in ["BTC_5M_UP", "ETH_5M_UP", "BTC_15M_UP", "ETH_15M_UP"]:
            snap = self._polymarket.get_snapshot(label)
            if snap:
                table.add_row(
                    "Polymarket",
                    label,
                    f"{snap.yes_price:.4f}",
                    f"{snap.spread:.4f}",
                    f"{snap.age_ms:.0f}ms",
                )

        return Panel(table, title="Live Prices", border_style="blue")

    def _trades_panel(self) -> Panel:
        table = Table(expand=True, box=None)
        table.add_column("Time", style="dim")
        table.add_column("Market", style="cyan", no_wrap=True)
        table.add_column("Dir", style="white")
        table.add_column("Entry", justify="right")
        table.add_column("Exit", justify="right")
        table.add_column("PnL", justify="right")

        recent = self._executor.closed_trades[-10:]
        for trade in reversed(recent):
            pnl_color = "green" if trade.pnl >= 0 else "red"
            closed_time = datetime.fromtimestamp(trade.closed_at or trade.opened_at).strftime("%H:%M:%S")
            table.add_row(
                closed_time,
                trade.signal_label,
                trade.direction,
                f"{trade.entry_price:.4f}",
                f"{trade.exit_price:.4f}" if trade.exit_price is not None else "—",
                f"[{pnl_color}]${trade.pnl:+.2f}[/]",
            )

        if not recent:
            table.add_row("—", "—", "—", "—", "—", "—")

        return Panel(table, title="Last 10 Trades", border_style="magenta")

    def _footer_panel(self) -> Panel:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        kill_msg = f"  |  [red bold]KILLED: {self._risk.kill_reason}[/]" if self._risk.is_killed else ""
        text = Text.from_markup(
            f"  {now}  |  "
            f"Max DD: {self._config.max_daily_drawdown_pct:.0f}%  |  "
            f"Min Edge: {self._config.min_edge_pct:.0f}%  |  "
            f"Kelly: {self._config.kelly_fraction:.0%}"
            f"{kill_msg}"
        )
        return Panel(text, style="dim")
