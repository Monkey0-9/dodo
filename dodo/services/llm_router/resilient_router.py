import asyncio
import time
from typing import Optional, Tuple, TYPE_CHECKING, List

from sqlalchemy import select
from dodo.log import get_logger
from dodo.server.db import db_registry
from dodo.orm.circuit_breaker import CircuitBreakerState
from dodo.otel.metric_registry import MetricRegistry

if TYPE_CHECKING:
    from dodo.schemas.llm_config import LLMConfig
    from dodo.schemas.user import User

logger = get_logger(__name__)

# Default model rankings for auto-mode resolution
# Tier 1: High intelligence (O1, Claude 3.5 Sonnet, GPT-4o)
# Tier 2: Balanced (GPT-4o-mini, Claude 3 Haiku)
# Tier 3: High speed / Low cost (Haiku, Mini)
MODEL_RANKINGS = {
    "dodo/auto": [
        "anthropic/claude-3-7-sonnet",
        "anthropic/claude-3-5-sonnet",
        "openai/gpt-4o",
        "openai/gpt-4-turbo",
    ],
    "dodo/auto-fast": [
        "openai/gpt-4o-mini",
        "anthropic/claude-3-5-haiku",
        "anthropic/claude-3-haiku",
    ],
}


class CircuitBreaker:
    def __init__(self, handle: str, failure_threshold: int = 3, reset_timeout: int = 60):
        self.handle = handle
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failures = 0
        self.successes = 0
        self.last_failure_time = 0.0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.avg_latency_ms = None

    def record_failure(self):
        old_state = self.state
        self.failures += 1
        self.successes = 0
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = "OPEN"
            if old_state != "OPEN":
                logger.warning(f"Circuit breaker OPEN for model: {self.handle}")
                MetricRegistry().circuit_breaker_transitions_counter.add(
                    1, attributes={"model_handle": self.handle, "transition": "open"}
                )

    def record_success(self, latency_ms: Optional[float] = None):
        old_state = self.state
        self.failures = 0
        self.successes += 1
        self.state = "CLOSED"

        if old_state == "HALF_OPEN" or old_state == "OPEN":
            logger.info(f"Circuit breaker CLOSED for model: {self.handle}")
            MetricRegistry().circuit_breaker_transitions_counter.add(
                1, attributes={"model_handle": self.handle, "transition": "closed"}
            )

        if latency_ms is not None:
            MetricRegistry().provider_latency_ms_histogram.record(
                latency_ms, attributes={"model_handle": self.handle}
            )
            if self.avg_latency_ms is None:
                self.avg_latency_ms = latency_ms
            else:
                # Rolling average (0.1 weight for new sample)
                self.avg_latency_ms = (self.avg_latency_ms * 0.9) + (latency_ms * 0.1)

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.reset_timeout:
                self.state = "HALF_OPEN"
                return True
            return False
        return True  # HALF_OPEN

    def to_orm_dict(self):
        return {
            "handle": self.handle,
            "failure_count": self.failures,
            "success_count": self.successes,
            "state": self.state.lower(),
            "avg_latency_ms": self.avg_latency_ms,
            "last_failure_at": self.last_failure_time
        }

    @classmethod
    def from_orm(cls, state: CircuitBreakerState):
        cb = cls(state.handle)
        cb.failures = state.failure_count
        cb.successes = state.success_count
        cb.state = state.state.upper()
        cb.avg_latency_ms = state.avg_latency_ms
        cb.last_failure_time = state.last_failure_at or 0.0
        return cb


class ResilientRoutingClient:
    """
    In-memory resilient LLM router.
    Provides circuit breaking and fallback logic without requiring Redis.
    """

    _instance = None
    _lock = asyncio.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ResilientRoutingClient, cls).__new__(cls)
            cls._instance.circuit_breakers = {}
            cls._instance._initialized = False
        return cls._instance

    async def _init_from_db(self):
        """Lazy initialization from database."""
        if self._initialized:
            return

        async with self._lock:
            if self._initialized:
                return

            try:
                async with db_registry.async_session() as session:
                    stmt = select(CircuitBreakerState)
                    result = await session.execute(stmt)
                    states = result.scalars().all()
                    for state in states:
                        self.circuit_breakers[state.handle] = CircuitBreaker.from_orm(state)
                self._initialized = True
                logger.info(f"Initialized {len(self.circuit_breakers)} states from DB")
            except Exception as e:
                logger.warning(f"Failed to load circuit breaker states from DB: {e}")

    async def _get_breaker(self, handle: str) -> CircuitBreaker:
        await self._init_from_db()
        if handle not in self.circuit_breakers:
            self.circuit_breakers[handle] = CircuitBreaker(handle)
        return self.circuit_breakers[handle]

    async def _persist_state(self, cb: CircuitBreaker):
        """Persists the state of a circuit breaker to the database."""
        try:
            async with db_registry.async_session() as session:
                state_data = cb.to_orm_dict()
                stmt = select(CircuitBreakerState).where(CircuitBreakerState.handle == cb.handle)
                result = await session.execute(stmt)
                db_state = result.scalar_one_or_none()
                
                if db_state:
                    for key, value in state_data.items():
                        setattr(db_state, key, value)
                else:
                    db_state = CircuitBreakerState(**state_data)
                    session.add(db_state)

                await session.commit()
        except Exception as e:
            logger.warning(f"Failed to persist circuit breaker state for {cb.handle}: {e}")

    async def resolve_auto_mode_config(
        self,
        stored_llm_config: "LLMConfig",
        actor: "User",
    ) -> Tuple["LLMConfig", bool, str]:
        """
        Resolves an auto-mode handle to the best available provider config.
        """
        handle = stored_llm_config.handle
        candidates = MODEL_RANKINGS.get(handle, MODEL_RANKINGS["dodo/auto"])

        from dodo.services.provider_manager import ProviderManager

        pm = ProviderManager()

        last_error = None
        for candidate_handle in candidates:
            breaker = await self._get_breaker(candidate_handle)
            if not breaker.can_execute():
                continue

            try:
                resolved_config = await pm.get_llm_config_from_handle(
                    candidate_handle, actor
                )
                # Success! Return the first available and healthy candidate
                return resolved_config, True, candidate_handle
            except Exception as e:
                last_error = e
                continue

        # If no preferred candidates work, find ANY available LLM for the user
        try:
            available_models = await pm.list_models_async(actor, model_type="llm")
            if available_models:
                # Pick the first enabled model that isn't an auto-handle
                for m in available_models:
                    if "/" in m.handle and "auto" not in m.handle:
                        breaker = await self._get_breaker(m.handle)
                        if breaker.can_execute():
                            resolved_config = await pm.get_llm_config_from_handle(
                                m.handle, actor
                            )
                            return resolved_config, False, m.handle
        except Exception:
            pass

        raise RuntimeError(
            f"Failed to resolve auto-mode handle {handle}. "
            f"No healthy providers found. Last error: {last_error}"
        )

    async def record_failure(self, handle: str) -> None:
        cb = await self._get_breaker(handle)
        cb.record_failure()
        await self._persist_state(cb)

    async def record_success(self, handle: str, latency_ms: float | None = None) -> None:
        """
        Records a successful request for a model handle.
        """
        cb = await self._get_breaker(handle)
        cb.record_success(latency_ms)
        await self._persist_state(cb)

        if latency_ms is not None:
            logger.debug(f"[LLM ROUTER]: Success for {handle} in {latency_ms:.2f}ms")

    def get_fallback_handle(self, handle: str) -> Optional[str]:
        """
        Suggests a fallback handle for a given primary.
        """
        # Simple heuristic: try Anthropic of similar tier, and vice versa.
        if "openai/gpt-4" in handle:
            return "anthropic/claude-3-5-sonnet"
        if "anthropic/claude-3-5-sonnet" in handle:
            return "openai/gpt-4o"
        if "mini" in handle or "haiku" in handle:
            if "anthropic" in handle:
                return "openai/gpt-4o-mini"
            else:
                return "anthropic/claude-3-5-haiku"

        return None

    async def get_fallback_config_for_handle(
        self,
        fallback_handle: str,
        stored_llm_config: "LLMConfig",
        actor: "User",
    ) -> "LLMConfig":
        from dodo.services.provider_manager import ProviderManager

        pm = ProviderManager()
        return await pm.get_llm_config_from_handle(fallback_handle, actor)

    def apply_reroute_rules(
        self,
        resolved_config: "LLMConfig",
        messages: List,
        stored_llm_config: "LLMConfig",
        agent_state,
    ) -> "LLMConfig":
        """
        Applies rules like 'if message has image, use vision-capable model'.
        """
        # 1. Vision upgrade rule
        has_image = False
        for msg in messages:
            content = getattr(msg, "content", [])
            if isinstance(content, list):
                for part in content:
                    # Handle both dict and object types
                    part_type = getattr(part, "type", None) or (
                        part.get("type") if isinstance(part, dict) else None
                    )
                    if part_type == "image_url":
                        has_image = True
                        break
            if has_image:
                break

        if has_image:
            # Check if current model supports vision.
            # If not, upgrade to gpt-4o or sonnet
            supports_vision = getattr(resolved_config, "supports_vision", False)
            if not supports_vision:
                logger.info(
                    "[LLM ROUTER]: Upgrading to vision-capable model for image"
                )
                # Heuristic: use gpt-4o as the universal vision fallback
                if "anthropic" in resolved_config.handle:
                    resolved_config.handle = "anthropic/claude-3-5-sonnet"
                else:
                    resolved_config.handle = "openai/gpt-4o"

        # 2. Long context rule (placeholder for future expansion)
        # If tokens > 100k, prefer 1M context models

        return resolved_config
