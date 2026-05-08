"""LLM routing client with circuit breaker and fallback support.

Conditionally imports Redis-backed implementation or falls back to noop base.
"""

try:
    from .llm_router_client import LLMRoutingClient, get_llm_routing_client
except ImportError:
    from .resilient_router import ResilientRoutingClient as LLMRoutingClient

    _router_instance = None

    async def get_llm_routing_client():
        global _router_instance
        if _router_instance is None:
            _router_instance = LLMRoutingClient()
        return _router_instance


__all__ = [
    "LLMRoutingClient",
    "get_llm_routing_client",
]
