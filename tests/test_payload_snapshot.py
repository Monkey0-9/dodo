import pytest
import json
import os
from unittest.mock import patch, MagicMock
from dodo.llm_api.anthropic_client import AnthropicClient
from dodo.schemas.llm_config import LLMConfig
from dodo.schemas.message import Message, MessageRole
from dodo.schemas.tool import Tool

@pytest.fixture
def snapshot(request):
    """Simple snapshot testing fixture."""
    test_dir = os.path.dirname(request.node.fspath)
    snap_dir = os.path.join(test_dir, "__snapshots__")
    os.makedirs(snap_dir, exist_ok=True)
    
    def assert_match(data, name):
        snap_file = os.path.join(snap_dir, f"{request.node.name}_{name}.json")
        serialized = json.dumps(data, indent=2, sort_keys=True)
        
        if not os.path.exists(snap_file) or os.environ.get("UPDATE_SNAPSHOTS"):
            with open(snap_file, "w") as f:
                f.write(serialized)
        
        with open(snap_file, "r") as f:
            expected = f.read()
            
        assert serialized == expected, f"Snapshot mismatch for {name}"
        
    return assert_match

@pytest.mark.asyncio
async def test_anthropic_payload_snapshot(snapshot):
    client = AnthropicClient()
    llm_config = LLMConfig(model="claude-3-5-sonnet-20241022", model_endpoint_type="anthropic")
    messages = [
        Message(role=MessageRole.system, content="You are a helpful assistant"),
        Message(role=MessageRole.user, content="Hello")
    ]
    tools = [
        Tool(name="test_tool", description="A test tool")
    ]
    
    # We just want to test the payload formatting
    with patch("anthropic.AsyncAnthropic") as mock_anthropic:
        mock_messages = MagicMock()
        mock_messages.create.return_value = MagicMock()
        mock_anthropic.return_value.messages = mock_messages
        
        # Test formatting without actually sending
        formatted_messages = client._format_messages(messages)
        formatted_tools = [client._format_tool(t) for t in tools]
        
        snapshot(formatted_messages, "messages")
        snapshot(formatted_tools, "tools")
