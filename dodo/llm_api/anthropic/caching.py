from typing import Any, Dict, List
from dodo.schemas.llm_config import LLMConfig

def apply_cache_control(messages: List[Dict[str, Any]], tools: List[Dict[str, Any]] = None) -> None:
    """Apply Anthropic ephemeral cache control to messages and tools."""
    # Add cache control to the last tool
    if tools and len(tools) > 0:
        tools[-1]["cache_control"] = {"type": "ephemeral"}

    # Add cache control to final message for incremental conversation caching
    if messages and len(messages) > 0:
        last_msg = messages[-1]
        content = last_msg.get("content")
        if isinstance(content, list) and len(content) > 0:
            # Mark the final block of the final message
            content[-1]["cache_control"] = {"type": "ephemeral"}
        elif isinstance(content, str):
            # Convert string to list of blocks to support cache_control
            last_msg["content"] = [
                {"type": "text", "text": content, "cache_control": {"type": "ephemeral"}}
            ]
