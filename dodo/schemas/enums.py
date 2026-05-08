from enum import Enum, StrEnum


class PrimitiveType(str, Enum):
    """
    Enum for all primitive resource types in dodo.

    The enum values ARE the actual ID prefixes used in the system.
    This serves as the single source of truth for all ID prefixes.
    """

    AGENT = "agent"
    MESSAGE = "message"
    RUN = "run"
    JOB = "job"
    GROUP = "group"
    BLOCK = "block"
    FILE = "file"
    FOLDER = "source"  # Note: folder IDs use "source" prefix for historical reasons
    SOURCE = "source"
    TOOL = "tool"
    ARCHIVE = "archive"
    PASSAGE = "passage"
    PROVIDER = "provider"
    PROVIDER_MODEL = "model"
    SANDBOX_CONFIG = "sandbox"  # Note: sandbox_config IDs use "sandbox" prefix
    STEP = "step"
    IDENTITY = "identity"
    CONVERSATION = "conv"

    # Infrastructure types
    MCP_SERVER = "mcp_server"
    MCP_OAUTH = "mcp-oauth"
    FILE_AGENT = "file_agent"

    # Configuration types
    SANDBOX_ENV = "sandbox-env"
    AGENT_ENV = "agent-env"

    # Core entity types
    USER = "user"
    ORGANIZATION = "org"
    TOOL_RULE = "tool_rule"

    # Batch processing types
    BATCH_ITEM = "batch_item"
    BATCH_REQUEST = "batch_req"

    # Telemetry types
    PROVIDER_TRACE = "provider_trace"


class ProviderType(str, Enum):
    anthropic = "anthropic"
    azure = "azure"
    baseten = "baseten"
    bedrock = "bedrock"
    cerebras = "cerebras"
    chatgpt_oauth = "chatgpt_oauth"
    deepseek = "deepseek"
    fireworks = "fireworks"
    google_ai = "google_ai"
    google_vertex = "google_vertex"
    groq = "groq"
    hugging_face = "hugging-face"
    dodo = "dodo"
    lmstudio_openai = "lmstudio_openai"
    minimax = "minimax"
    mistral = "mistral"
    ollama = "ollama"
    openai = "openai"
    together = "together"
    vllm = "vllm"
    sglang = "sglang"
    openrouter = "openrouter"
    xai = "xai"
    zai = "zai"
    zai_coding = "zai_coding"


class AgentType(str, Enum):
    """
    Enum to represent the type of agent.
    """

    dodo_agent = "dodo_agent"  # the OG set of dodo tools
    dodo_v2_agent = "dodo_v2_agent"  # dodo style tools, but refreshed
    dodo_v1_agent = "dodo_v1_agent"  # simplification of the dodo loop, no heartbeats or forced tool calls
    react_agent = "react_agent"  # basic react agent, no memory tools
    workflow_agent = "workflow_agent"  # workflow with auto-clearing message buffer
    split_thread_agent = "split_thread_agent"
    sleeptime_agent = "sleeptime_agent"
    voice_convo_agent = "voice_convo_agent"
    voice_sleeptime_agent = "voice_sleeptime_agent"


class ProviderCategory(str, Enum):
    base = "base"
    byok = "byok"


class LLMCallType(str, Enum):
    """Type of LLM call for telemetry tracking."""

    agent_step = "agent_step"
    summarization = "summarization"
    tool_generation = "tool_generation"


class MessageRole(str, Enum):
    assistant = "assistant"
    user = "user"
    tool = "tool"
    function = "function"
    system = "system"
    approval = "approval"
    summary = "summary"


class MessageSourceType(str, Enum):
    input = "input"  # external input
    output = "output"  # internal output


class OptionState(str, Enum):
    """Useful for kwargs that are bool + default option"""

    YES = "yes"
    NO = "no"
    DEFAULT = "default"


class JobStatus(StrEnum):
    """
    Status of the job.
    """

    #  TODO (cliandy): removed `not_started`, but what does `pending` or `expired` here mean and where do we use them?
    created = "created"
    running = "running"
    completed = "completed"
    failed = "failed"
    pending = "pending"
    cancelled = "cancelled"
    expired = "expired"

    @property
    def is_terminal(self):
        return self in (JobStatus.completed, JobStatus.failed, JobStatus.cancelled, JobStatus.expired)


class RunStatus(StrEnum):
    """
    Status of the run.
    """

    created = "created"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class AgentStepStatus(str, Enum):
    """
    Status of agent step.
    TODO (cliandy): consolidate this with job status
    """

    paused = "paused"
    resumed = "resumed"
    completed = "completed"


class MessageStreamStatus(str, Enum):
    done = "[DONE]"

    def model_dump_json(self):
        return "[DONE]"


class ToolRuleType(str, Enum):
    """
    Type of tool rule.
    """

    # note: some of these should be renamed when we do the data migration

    run_first = "run_first"
    exit_loop = "exit_loop"  # reasoning loop should exit
    continue_loop = "continue_loop"
    conditional = "conditional"
    constrain_child_tools = "constrain_child_tools"
    max_count_per_step = "max_count_per_step"
    parent_last_tool = "parent_last_tool"
    required_before_exit = "required_before_exit"  # tool must be called before loop can exit
    requires_approval = "requires_approval"


class FileProcessingStatus(str, Enum):
    PENDING = "pending"
    PARSING = "parsing"
    EMBEDDING = "embedding"
    COMPLETED = "completed"
    ERROR = "error"

    def is_terminal_state(self) -> bool:
        """Check if the processing status is in a terminal state (completed or error)."""
        return self in (FileProcessingStatus.COMPLETED, FileProcessingStatus.ERROR)


class ToolType(str, Enum):
    CUSTOM = "custom"
    dodo_CORE = "dodo_core"
    dodo_MEMORY_CORE = "dodo_memory_core"
    dodo_MULTI_AGENT_CORE = "dodo_multi_agent_core"
    dodo_SLEEPTIME_CORE = "dodo_sleeptime_core"
    dodo_VOICE_SLEEPTIME_CORE = "dodo_voice_sleeptime_core"
    dodo_BUILTIN = "dodo_builtin"
    dodo_FILES_CORE = "dodo_files_core"
    EXTERNAL_LANGCHAIN = "external_langchain"  # DEPRECATED
    EXTERNAL_COMPOSIO = "external_composio"  # DEPRECATED
    # TODO is "external" the right name here? Since as of now, MCP is local / doesn't support remote?
    EXTERNAL_MCP = "external_mcp"


class JobType(str, Enum):
    JOB = "job"
    RUN = "run"
    BATCH = "batch"


class ToolSourceType(str, Enum):
    """Defines what a tool was derived from"""

    python = "python"
    typescript = "typescript"
    json = "json"  # TODO (cliandy): is this still valid?


class ActorType(str, Enum):
    dodo_USER = "dodo_user"
    dodo_AGENT = "dodo_agent"
    dodo_SYSTEM = "dodo_system"


class MCPServerType(str, Enum):
    SSE = "sse"
    STDIO = "stdio"
    STREAMABLE_HTTP = "streamable_http"


class DuplicateFileHandling(str, Enum):
    """How to handle duplicate filenames when uploading files"""

    SKIP = "skip"  # skip files with duplicate names
    ERROR = "error"  # error when duplicate names are encountered
    SUFFIX = "suffix"  # add numeric suffix to make names unique (default behavior)
    REPLACE = "replace"  # replace the file with the duplicate name


class SandboxType(str, Enum):
    E2B = "e2b"
    MODAL = "modal"
    LOCAL = "local"


class StepStatus(str, Enum):
    """Status of a step execution"""

    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class VectorDBProvider(str, Enum):
    """Supported vector database providers for archival memory"""

    NATIVE = "native"
    TPUF = "tpuf"
    PINECONE = "pinecone"


class TagMatchMode(str, Enum):
    """Tag matching behavior for filtering"""

    ANY = "any"
    ALL = "all"


class ComparisonOperator(str, Enum):
    """Comparison operators for filtering numeric values"""

    EQ = "eq"  # equals
    GTE = "gte"  # greater than or equal
    LTE = "lte"  # less than or equal


