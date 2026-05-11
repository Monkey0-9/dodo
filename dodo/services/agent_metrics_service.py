import logging
import time

logger = logging.getLogger(__name__)

class AgentMetricsService:
    """Service to track latency and other metrics for the agent."""
    def __init__(self):
        pass

    def start_latency_timer(self) -> int:
        """Starts a high-resolution timer."""
        return time.perf_counter_ns()

    def record_latency(self, start_ns: int, context: str):
        """Records the latency since the timer started in the hot path."""
        duration_ns = time.perf_counter_ns() - start_ns
        duration_ms = duration_ns / 1_000_000
        logger.info(f"Latency tracking [{context}]: {duration_ms:.2f} ms")
        # In a real system, this would push to OTEL or ClickHouse
        
metrics_service = AgentMetricsService()
