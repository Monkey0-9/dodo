"""
Anthropic Beta Header Builder — Phase 2: Architectural Deconstruction

Extracted from AnthropicClient to make beta assembly logic independently testable
and reduce the size of the monolithic anthropic_client.py.

Usage:
    from dodo.llm_api.anthropic.beta_builder import build_beta_headers, _supports_structured_outputs
    betas = build_beta_headers(llm_config)
"""

from __future__ import annotations

import logging
from typing import List

logger = logging.getLogger(__name__)


def _supports_structured_outputs(model: str) -> bool:
    """Check if the given model supports Anthropic structured outputs beta.

    Structured outputs are currently supported for Claude 3.7 Sonnet, Opus 4.x,
    Sonnet 4.x, Haiku 3.5, and newer models.

    Args:
        model: The Anthropic model identifier string.

    Returns:
        True if structured outputs are supported, False otherwise.
    """
    supported_prefixes = [
        "claude-3-7-sonnet",
        "claude-opus-4",
        "claude-sonnet-4",
        "claude-haiku-3-5",
        "claude-3-5-sonnet",
        "claude-3-5-haiku",
    ]
    return any(model.startswith(prefix) for prefix in supported_prefixes)


def build_beta_headers(llm_config) -> List[str]:
    """Assemble the list of Anthropic beta feature flags for a given LLMConfig.

    Centralises all beta header assembly logic that was previously scattered
    across `request`, `request_async`, and `stream_async` in AnthropicClient.
    Each flag is only added when the corresponding feature is active for the
    given model and configuration.

    Args:
        llm_config: An LLMConfig instance describing the model and its settings.

    Returns:
        A list of Anthropic beta identifier strings to pass as the `betas`
        parameter to the Anthropic SDK.
    """
    betas: List[str] = []
    model: str = llm_config.model

    # ── Reasoning / Thinking ─────────────────────────────────────────────────
    if getattr(llm_config, "enable_reasoner", False):
        if model.startswith("claude-opus-4-6") or model.startswith("claude-sonnet-4-6"):
            # Adaptive thinking for newest frontier models
            betas.append("adaptive-thinking-2026-01-28")
        else:
            # Interleaved thinking for earlier reasoners (Opus 4.5, Sonnet 3.7, …)
            betas.append("interleaved-thinking-2025-05-14")

    # ── 1M Context Window ────────────────────────────────────────────────────
    try:
        from dodo.settings import model_settings

        if getattr(model_settings, "anthropic_sonnet_1m", False) and (
            model.startswith("claude-sonnet-4") or model.startswith("claude-sonnet-4-5")
        ):
            betas.append("context-1m-2025-08-07")
        elif getattr(model_settings, "anthropic_opus_1m", False) and model.startswith("claude-opus-4-6"):
            betas.append("context-1m-2025-08-07")
    except Exception as exc:  # pragma: no cover
        logger.exception("Unexpected error reading model_settings for 1M context: %s", exc)

    # ── Effort Control ───────────────────────────────────────────────────────
    effort_models = ("claude-opus-4-5", "claude-opus-4-6", "claude-sonnet-4-6")
    effort = getattr(llm_config, "effort", None)
    if any(model.startswith(m) for m in effort_models) and effort is not None:
        betas.append("effort-2025-11-24")
        # Maximum effort available for Opus 4.6 / Sonnet 4.6 only
        if (model.startswith("claude-opus-4-6") or model.startswith("claude-sonnet-4-6")) and effort == "max":
            betas.append("max-effort-2026-01-24")

    # ── Context Management (Opus 4.5 + reasoning) ───────────────────────────
    if model.startswith("claude-opus-4-5") and getattr(llm_config, "enable_reasoner", False):
        betas.append("context-management-2025-06-27")

    # ── Structured Outputs ───────────────────────────────────────────────────
    if getattr(llm_config, "strict", False) and _supports_structured_outputs(model):
        betas.append("structured-outputs-2025-11-13")

    return betas


def build_streaming_betas(llm_config) -> List[str]:
    """Build beta headers for streaming requests.

    Extends :func:`build_beta_headers` with the fine-grained tool streaming
    flag required for optimal streaming performance.

    Args:
        llm_config: An LLMConfig instance.

    Returns:
        Beta list with fine-grained tool streaming prepended.
    """
    betas = ["fine-grained-tool-streaming-2025-05-14"]
    betas.extend(build_beta_headers(llm_config))
    return betas
