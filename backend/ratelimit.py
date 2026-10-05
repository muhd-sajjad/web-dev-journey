import time
from collections import defaultdict, deque

from fastapi import HTTPException, status


class FailedAttemptTracker:
    """In-memory limiter for failed logins, keyed by account (e.g. email).

    Good enough for a single-process app. If you run several workers or
    instances, move this to Redis so the counts are shared.
    """

    def __init__(self, max_attempts: int = 5, window_seconds: int = 600):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._attempts: dict[str, deque[float]] = defaultdict(deque)

    def _prune(self, key: str) -> deque[float]:
        attempts = self._attempts[key]
        cutoff = time.monotonic() - self.window_seconds
        while attempts and attempts[0] < cutoff:
            attempts.popleft()
        return attempts

    def check(self, key: str) -> None:
        if len(self._prune(key)) >= self.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Please try again in a few minutes.",
            )

    def record_failure(self, key: str) -> None:
        self._prune(key).append(time.monotonic())

    def reset(self, key: str) -> None:
        self._attempts.pop(key, None)

    def reset_all(self) -> None:
        self._attempts.clear()
