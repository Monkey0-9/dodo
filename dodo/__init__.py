import os
from importlib.metadata import PackageNotFoundError, version

try:
    __version__ = version("dodo")
except PackageNotFoundError:
    # Fallback for development installations
    __version__ = "0.16.7"

if os.environ.get("dodo_VERSION"):
    __version__ = os.environ["dodo_VERSION"]

# Import sqlite_functions early to ensure event handlers are registered (only for SQLite)
# This is only needed for the server, not for client usage
try:
    from dodo.settings import DatabaseChoice, settings

    if settings.database_engine == DatabaseChoice.SQLITE:
        from dodo.orm import sqlite_functions  # noqa: F401
except ImportError:
    # If sqlite_vec is not installed, it's fine for client usage
    pass

# # imports for easier access
from dodo.schemas.agent import AgentState as AgentState
from dodo.schemas.block import Block as Block
from dodo.schemas.embedding_config import EmbeddingConfig as EmbeddingConfig
from dodo.schemas.enums import JobStatus as JobStatus
from dodo.schemas.file import FileMetadata as FileMetadata
from dodo.schemas.job import Job as Job
from dodo.schemas.dodo_message import dodoErrorMessage as dodoErrorMessage, dodoMessage as dodoMessage, dodoPing as dodoPing
from dodo.schemas.dodo_stop_reason import dodoStopReason as dodoStopReason
from dodo.schemas.llm_config import LLMConfig as LLMConfig
from dodo.schemas.memory import (
    ArchivalMemorySummary as ArchivalMemorySummary,
    BasicBlockMemory as BasicBlockMemory,
    ChatMemory as ChatMemory,
    Memory as Memory,
    RecallMemorySummary as RecallMemorySummary,
)
from dodo.schemas.message import Message as Message
from dodo.schemas.organization import Organization as Organization
from dodo.schemas.passage import Passage as Passage
from dodo.schemas.source import Source as Source
from dodo.schemas.tool import Tool as Tool
from dodo.schemas.usage import dodoUsageStatistics as dodoUsageStatistics
from dodo.schemas.user import User as User

