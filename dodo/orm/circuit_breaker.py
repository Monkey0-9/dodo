from typing import Optional

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from dodo.orm.sqlalchemy_base import SqlalchemyBase


class CircuitBreakerState(SqlalchemyBase):
    """
    Persistent state for the LLM Resilient Routing circuit breakers.
    Stores failure counts, recovery status, and avg latency for each handle.
    """

    __tablename__ = "circuit_breaker_states"

    handle: Mapped[str] = mapped_column(
        String, primary_key=True, doc="The model handle (e.g. gpt-4o)"
    )
    failure_count: Mapped[int] = mapped_column(
        Integer, default=0, doc="Consecutive failures"
    )
    success_count: Mapped[int] = mapped_column(
        Integer, default=0, doc="Consecutive successes"
    )
    state: Mapped[str] = mapped_column(
        String, default="closed", doc="Current state"
    )
    avg_latency_ms: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True, doc="Rolling avg latency"
    )
    last_failure_at: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True, doc="Last failure timestamp"
    )

    def to_dict(self):
        return {
            "handle": self.handle,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "state": self.state,
            "avg_latency_ms": self.avg_latency_ms,
            "last_failure_at": self.last_failure_at,
        }
