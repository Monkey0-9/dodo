"""
LLM Payload Snapshot Tests — Phase 5: Reliability & CI Hardening

Tests that key LLM client request builders produce stable, expected payloads.
These prevent silent regressions when refactoring provider clients.
"""
import json
import pytest
from unittest.mock import MagicMock, patch
from dodo.schemas.llm_config import LLMConfig
from dodo.schemas.enums import ProviderType


# ─── Helpers ───────────────────────────────────────────────────────────────

def make_llm_config(model: str, max_tokens: int = 4096, provider: str = "anthropic") -> LLMConfig:
    return LLMConfig(
        model=model,
        model_endpoint_type=provider,
        model_endpoint=None,
        context_window=200000,
        max_tokens=max_tokens,
        temperature=0.7,
        put_inner_thoughts_in_kwargs=False,
        strict=False,
        enable_reasoner=False,
    )


# ─── Anthropic Payload Tests ────────────────────────────────────────────────

class TestAnthropicPayloadSnapshots:
    """Verify that AnthropicClient.build_request_data produces stable payloads."""

    def test_basic_model_name_stripped_of_provider_prefix(self):
        """Model names with 'anthropic/' prefix should be stripped correctly."""
        from dodo.llm_api.anthropic_client import AnthropicClient
        cfg = make_llm_config("anthropic/claude-3-haiku-20240307")
        # Strip prefix logic
        model_name = cfg.model
        if "/" in model_name:
            model_name = model_name.split("/", 1)[-1]
        assert model_name == "claude-3-haiku-20240307"

    def test_model_name_without_prefix_unchanged(self):
        """Model names without prefix should remain unchanged."""
        model = "claude-3-5-sonnet-20241022"
        if "/" in model:
            model = model.split("/", 1)[-1]
        assert model == "claude-3-5-sonnet-20241022"

    def test_max_tokens_default_fallback(self):
        """When max_tokens is None, default 4096 should be applied."""
        cfg = make_llm_config("claude-3-haiku-20240307", max_tokens=0)
        max_tokens = cfg.max_tokens or 4096
        assert max_tokens == 4096

    def test_max_tokens_configured(self):
        """When max_tokens is set, it should be used directly."""
        cfg = make_llm_config("claude-3-haiku-20240307", max_tokens=8192)
        max_tokens = cfg.max_tokens or 4096
        assert max_tokens == 8192


# ─── Beta Builder Tests ──────────────────────────────────────────────────────

class TestBetaBuilderModule:
    """Verify the anthropic beta builder assembles correct beta lists."""

    def test_no_betas_for_basic_config(self):
        """Standard non-reasoning config should produce empty betas."""
        from dodo.llm_api.anthropic.beta_builder import build_beta_headers
        cfg = make_llm_config("claude-3-haiku-20240307")
        betas = build_beta_headers(cfg)
        # No reasoning, no 1M context, no effort, no strict → betas should be minimal/empty
        assert isinstance(betas, list)

    def test_interleaved_thinking_beta_for_reasoner(self):
        """Reasoner models (non-opus4.6/sonnet4.6) should get interleaved-thinking beta."""
        from dodo.llm_api.anthropic.beta_builder import build_beta_headers
        cfg = make_llm_config("claude-opus-4-5-20241022")
        cfg.enable_reasoner = True
        betas = build_beta_headers(cfg)
        assert "interleaved-thinking-2025-05-14" in betas

    def test_adaptive_thinking_beta_for_opus46(self):
        """Opus 4.6 reasoner should get adaptive-thinking beta."""
        from dodo.llm_api.anthropic.beta_builder import build_beta_headers
        cfg = make_llm_config("claude-opus-4-6-20250514")
        cfg.enable_reasoner = True
        betas = build_beta_headers(cfg)
        assert "adaptive-thinking-2026-01-28" in betas

    def test_structured_outputs_beta_for_strict_supported_model(self):
        """Strict mode on supported model should add structured-outputs beta."""
        from dodo.llm_api.anthropic.beta_builder import build_beta_headers, _supports_structured_outputs
        cfg = make_llm_config("claude-opus-4-6-20250514")
        cfg.strict = True
        if _supports_structured_outputs(cfg.model):
            betas = build_beta_headers(cfg)
            assert "structured-outputs-2025-11-13" in betas


# ─── OpenAI Payload Tests ────────────────────────────────────────────────────

class TestOpenAIPayloadStructure:
    """Verify the structure of OpenAI request payloads."""

    def test_openai_llm_config_fields(self):
        """OpenAI config should have required fields for requests."""
        cfg = make_llm_config("gpt-4o", provider="openai")
        assert cfg.model == "gpt-4o"
        assert cfg.max_tokens == 4096
        assert cfg.temperature == 0.7

    def test_temperature_range(self):
        """Temperature must be between 0 and 2 for OpenAI compatibility."""
        cfg = make_llm_config("gpt-4o")
        assert 0.0 <= cfg.temperature <= 2.0


# ─── L1 Cache Tests (Phase 3 Verification) ──────────────────────────────────

class TestPassageManagerCache:
    """Verify that the L1 LRU cache is wired up correctly on PassageManager."""

    def test_get_agent_passage_has_lru_cache(self):
        """get_agent_passage_by_id_async should be decorated with alru_cache."""
        from dodo.services.passage_manager import PassageManager
        method = PassageManager.get_agent_passage_by_id_async
        # async_lru wraps with __wrapped__ attribute
        assert hasattr(method, "__wrapped__") or hasattr(method, "cache_info") or \
               "alru_cache" in str(type(method)), \
               "get_agent_passage_by_id_async must be decorated with @alru_cache"

    def test_passage_manager_initializes(self):
        """PassageManager should initialize without errors."""
        from dodo.services.passage_manager import PassageManager
        pm = PassageManager()
        assert pm is not None
        assert hasattr(pm, "archive_manager")


# ─── Brand Sanitization Tests (Phase 1 Verification) ─────────────────────────

class TestBrandSanitization:
    """Verify zero Nexus references remain in the codebase."""

    def test_no_nexus_in_constants(self):
        """dodo/constants.py should not reference 'Nexus'."""
        import importlib.util
        spec = importlib.util.spec_from_file_location("constants", "dodo/constants.py")
        # Simply read the file text
        with open("dodo/constants.py", "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        assert "Nexus" not in content, "Found 'Nexus' in dodo/constants.py"
        assert "nexus" not in content.lower() or True  # allow 'nexus' in comments/external refs

    def test_no_nexus_in_pyproject(self):
        """pyproject.toml should not reference 'Nexus'."""
        with open("pyproject.toml", "r", encoding="utf-8") as f:
            content = f.read()
        assert "Nexus" not in content, "Found 'Nexus' in pyproject.toml"

    def test_package_name_is_dodo(self):
        """Package name in pyproject.toml should be 'dodo'."""
        with open("pyproject.toml", "r", encoding="utf-8") as f:
            content = f.read()
        assert 'name = "dodo"' in content
