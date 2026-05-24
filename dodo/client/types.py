from dodo.errors import dodoError as APIError
from dodo.errors import HandleNotFoundError as NotFoundError
from dodo.errors import dodoInvalidArgumentError as BadRequestError
from dodo.errors import ConcurrentUpdateError as ConflictError
from dodo.errors import LLMUnprocessableEntityError as UnprocessableEntityError
from dodo.schemas.agent import AgentState, CreateAgent, UpdateAgent
from dodo.schemas.block import Block, CreateBlock
from dodo.schemas.dodo_message import (
    AssistantMessage,
    ReasoningMessage,
    SystemMessage,
    ToolCall,
    ToolCallMessage,
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
from dodo.schemas.run import Run
from dodo.schemas.dodo_stop_reason import dodoStopReason
from dodo.schemas.usage import dodoUsageStatistics
from dodo.schemas.enums import MessageStreamStatus
from dodo.schemas.enums import RunStatus
from dodo.schemas.dodo_message_content import (
    TextContent,
    ImageContent,
    ToolCallContent,
    ToolReturnContent,
    ReasoningContent,
)

# Aliases to match expected dodo_client.types
CreateBlockParam = CreateBlock
MessageCreateParam = MessageCreate

# More aliases as needed by tests
__all__ = [
    "APIError",
    "NotFoundError",
    "BadRequestError",
    "ConflictError",
    "UnprocessableEntityError",
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
    "ToolCallMessage",
    "ToolReturnMessage",
    "UserMessage",
    "CreateBlockParam",
    "MessageCreateParam",
    "Tool",
    "Run",
    "dodoStopReason",
    "dodoUsageStatistics",
    "MessageStreamStatus",
    "RunStatus",
    "TextContent",
    "ImageContent",
    "ToolCallContent",
    "ToolReturnContent",
    "ReasoningContent",
]
