"""Risk management module with kill switch."""

from __future__ import annotations

import logging
import time

from polymarket_arb.config import Config
from polymarket_arb.modules.executor import Executor

logger = logging.getLogger(__name__)


class RiskManager:
    """Monitors portfolio risk and triggers kill switch on excessive drawdown."""

    def __init__(self, config: Config, executor: Executor) -> None:
        self._config = config
        self._executor = executor
        self._killed = False
        self._kill_reason: str = ""
        self._kill_time: float | None = None
        self._drawdown_alerts_sent: set[int] = set()  # thresholds already alerted

    @property
    def is_killed(self) -> bool:
        return self._killed

    @property
    def kill_reason(self) -> str:
        return self._kill_reason

    @property
    def kill_time(self) -> float | None:
        return self._kill_time

    def check(self) -> tuple[bool, str]:
        """
        Check risk conditions. Returns (should_halt, reason).

        Call this before every trade and on a regular interval.
        """
        if self._killed:
            return True, self._kill_reason

        dd = self._executor.daily_drawdown_pct

        # Kill switch: daily drawdown exceeds threshold
        if dd >= self._config.max_daily_drawdown_pct:
            self._trigger_kill(
                f"Daily drawdown {dd:.1f}% >= {self._config.max_daily_drawdown_pct:.0f}% limit"
            )
            return True, self._kill_reason

        return False, ""

    def get_drawdown_alerts(self) -> list[str]:
        """Return drawdown threshold alerts that haven't been sent yet."""
        alerts: list[str] = []
        dd = self._executor.daily_drawdown_pct

        for threshold in [5, 10, 15]:
            if dd >= threshold and threshold not in self._drawdown_alerts_sent:
                self._drawdown_alerts_sent.add(threshold)
                alerts.append(
                    f"Drawdown alert: portfolio down {dd:.1f}% "
                    f"(threshold: {threshold}%)"
                )

        return alerts

    def _trigger_kill(self, reason: str) -> None:
        """Activate the kill switch."""
        self._killed = True
        self._kill_reason = reason
        self._kill_time = time.time()
        logger.critical("KILL SWITCH ACTIVATED: %s", reason)

    def reset(self) -> None:
        """Reset the kill switch (manual override)."""
        self._killed = False
        self._kill_reason = ""
        self._kill_time = None
        self._drawdown_alerts_sent.clear()
        logger.warning("Kill switch manually reset")
