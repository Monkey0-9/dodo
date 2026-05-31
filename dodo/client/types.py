from dodo.errors import (
    ConcurrentUpdateError as ConflictError,
    HandleNotFoundError as NotFoundError,
    LLMUnprocessableEntityError as UnprocessableEntityError,
    dodoError as APIError,
    dodoInvalidArgumentError as BadRequestError,
)
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
from dodo.schemas.dodo_message_content import (
    ImageContent,
    ReasoningContent,
    TextContent,
    ToolCallContent,
    ToolReturnContent,
)
from dodo.schemas.dodo_stop_reason import dodoStopReason
from dodo.schemas.enums import MessageStreamStatus, RunStatus
from dodo.schemas.message import Message, MessageCreate
from dodo.schemas.run import Run
from dodo.schemas.tool import Tool
from dodo.schemas.tool_rule import (
    ContinueToolRule,
    MaxCountPerStepToolRule,
    TerminalToolRule,
)
from dodo.schemas.usage import dodoUsageStatistics

# Aliases to match expected dodo_client.types
CreateBlockParam = CreateBlock
MessageCreateParam = MessageCreate

# More aliases as needed by tests
__all__ = [
    "APIError",
    "AgentState",
    "AssistantMessage",
    "BadRequestError",
    "Block",
    "ConflictError",
    "ContinueToolRule",
    "CreateAgent",
    "CreateBlock",
    "CreateBlockParam",
    "ImageContent",
    "MaxCountPerStepToolRule",
    "Message",
    "MessageCreate",
    "MessageCreateParam",
    "MessageStreamStatus",
    "NotFoundError",
    "ReasoningContent",
    "ReasoningMessage",
    "Run",
    "RunStatus",
    "SystemMessage",
    "TerminalToolRule",
    "TextContent",
    "Tool",
    "ToolCall",
    "ToolCallContent",
    "ToolCallMessage",
    "ToolReturnContent",
    "ToolReturnMessage",
    "UnprocessableEntityError",
    "UpdateAgent",
    "UserMessage",
    "dodoStopReason",
    "dodoUsageStatistics",
]
