from typing import Any, Dict, Optional
from dodo.schemas.llm_config import LLMConfig
from dodo.log import get_logger

logger = get_logger(__name__)

def apply_thinking_config(data: Dict[str, Any], llm_config: LLMConfig) -> None:
    """Apply Anthropic extended thinking (reasoning) configuration to the request data."""
    is_reasoning = (
        llm_config.model.startswith("claude-3-7-sonnet")
        or llm_config.model.startswith("claude-sonnet-4")
        or llm_config.model.startswith("claude-opus-4")
        or llm_config.model.startswith("claude-haiku-4-5")
        or llm_config.model.startswith("claude-opus-4-5")
        or llm_config.model.startswith("claude-opus-4-6")
        or llm_config.model.startswith("claude-sonnet-4-6")
    )

    if not (is_reasoning and llm_config.enable_reasoner):
        return

    # Opus 4.6 / Sonnet 4.6 uses Auto Thinking (no budget tokens)
    if llm_config.model.startswith("claude-opus-4-6") or llm_config.model.startswith("claude-sonnet-4-6"):
        data["thinking"] = {
            "type": "adaptive",
        }
    else:
        # Traditional extended thinking with budget tokens
        thinking_budget = max(llm_config.max_reasoning_tokens, 1024)
        if thinking_budget != llm_config.max_reasoning_tokens:
            logger.warning(
                f"Max reasoning tokens must be at least 1024 for Claude. Setting max_reasoning_tokens to 1024 for model {llm_config.model}."
            )
        data["thinking"] = {
            "type": "enabled",
            "budget_tokens": thinking_budget,
        }
    
    # temperature may only be set to 1 when thinking is enabled.
    data["temperature"] = 1.0
