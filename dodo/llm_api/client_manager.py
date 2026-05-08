import threading
from typing import Any, Dict

import anthropic
from openai import AsyncOpenAI, OpenAI

try:
    from google import genai
except ImportError:
    genai = None


class ClientManager:
    """
    Manages persistent LLM client instances to leverage connection pooling.
    This singleton ensures that we don't recreate clients on every request,
    significantly reducing latency for high-concurrency workloads.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ClientManager, cls).__new__(cls)
                cls._instance._async_clients = {}
                cls._instance._sync_clients = {}
        return cls._instance

    def _get_cache_key(self, provider: str, kwargs: Dict[str, Any]) -> str:
        """Generate a stable cache key based on client configuration."""
        # Focus on the core configuration that affects connection pooling
        api_key = kwargs.get("api_key")
        base_url = kwargs.get("base_url")
        # Sort headers to ensure stable key
        headers = str(sorted(kwargs.get("default_headers", {}).items()))
        return f"{provider}|{api_key}|{base_url}|{headers}"

    def get_async_openai_client(self, **kwargs) -> AsyncOpenAI:
        key = self._get_cache_key("openai", kwargs)
        if key not in self._async_clients:
            # Note: AsyncOpenAI manages its own connection pool via httpx
            self._async_clients[key] = AsyncOpenAI(**kwargs)
        return self._async_clients[key]

    def get_sync_openai_client(self, **kwargs) -> OpenAI:
        key = self._get_cache_key("openai", kwargs)
        if key not in self._sync_clients:
            self._sync_clients[key] = OpenAI(**kwargs)
        return self._sync_clients[key]

    def get_async_anthropic_client(self, **kwargs) -> anthropic.AsyncAnthropic:
        key = "anthropic|async|" + self._get_cache_key("anthropic", kwargs)
        if key not in self._async_clients:
            self._async_clients[key] = anthropic.AsyncAnthropic(**kwargs)
        return self._async_clients[key]

    def get_sync_anthropic_client(self, **kwargs) -> anthropic.Anthropic:
        key = "anthropic|sync|" + self._get_cache_key("anthropic", kwargs)
        if key not in self._sync_clients:
            self._sync_clients[key] = anthropic.Anthropic(**kwargs)
        return self._sync_clients[key]

    def get_google_client(self, **kwargs) -> Any:
        """Generic getter for Google AI / Vertex GenAI clients."""
        if genai is None:
            raise ImportError("google-genai is not installed")

        key = "google|genai|" + self._get_cache_key("google", kwargs)
        if key not in self._sync_clients:
            self._sync_clients[key] = genai.Client(**kwargs)
        return self._sync_clients[key]

    def set_client(self, provider: str, is_async: bool, key_parts: Dict[str, Any], client: Any):
        """Manually store a client instance in the cache."""
        prefix = "async|" if is_async else "sync|"
        key = prefix + self._get_cache_key(provider, key_parts)
        if is_async:
            self._async_clients[key] = client
        else:
            self._sync_clients[key] = client


# Global singleton instance
client_manager = ClientManager()
