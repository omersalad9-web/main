"""Async token-bucket rate limiter."""

from __future__ import annotations

import asyncio
import time


class RateLimiter:
    """Simple token-bucket rate limiter for async code."""

    def __init__(self, calls_per_second: float) -> None:
        self._interval = 1.0 / calls_per_second if calls_per_second > 0 else 0
        self._last_call = 0.0
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Wait until a call is permitted."""
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_call
            if elapsed < self._interval:
                await asyncio.sleep(self._interval - elapsed)
            self._last_call = time.monotonic()
