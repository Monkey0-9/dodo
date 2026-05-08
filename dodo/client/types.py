from dodo.errors import dodoError as APIError
from dodo.errors import HandleNotFoundError as NotFoundError
from dodo.schemas.agent import AgentState, CreateAgent, UpdateAgent
from dodo.schemas.block import Block, CreateBlock
from dodo.schemas.dodo_message import (
    AssistantMessage,
    ReasoningMessage,
    SystemMessage,
    ToolCall,
    ToolReturnMessage,
    UserMessage,
)
from dodo.schemas.message import Message, MessageCreate
from dodo.schemas.tool import Tool
from dodo.schemas.tool_rule import (
    ContinueToolRule,
    MaxCountPerStepToolRule,
    TerminalToolRule,
)

# Aliases to match expected dodo_client.types
CreateBlockParam = CreateBlock
MessageCreateParam = MessageCreate

# More aliases as needed by tests
__all__ = [
    "APIError",
    "NotFoundError",
    "AgentState",
    "CreateAgent",
    "UpdateAgent",
    "Block",
    "CreateBlock",
    "Message",
    "MessageCreate",
    "AssistantMessage",
    "ContinueToolRule",
    "MaxCountPerStepToolRule",
    "ReasoningMessage",
    "SystemMessage",
    "TerminalToolRule",
    "ToolCall",
    "ToolReturnMessage",
    "UserMessage",
    "CreateBlockParam",
    "MessageCreateParam",
    "Tool",
]
