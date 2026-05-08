from typing import TYPE_CHECKING, List

from sqlalchemy.orm import Mapped, mapped_column, relationship

from dodo.orm.sqlalchemy_base import SqlalchemyBase
from dodo.schemas.organization import Organization as PydanticOrganization

if TYPE_CHECKING:
    from dodo.orm import Source
    from dodo.orm.agent import Agent
    from dodo.orm.archive import Archive
    from dodo.orm.block import Block
    from dodo.orm.group import Group
    from dodo.orm.identity import Identity
    from dodo.orm.job import Job
    from dodo.orm.llm_batch_items import LLMBatchItem
    from dodo.orm.llm_batch_job import LLMBatchJob
    from dodo.orm.mcp_server import MCPServer
    from dodo.orm.message import Message
    from dodo.orm.passage import ArchivalPassage, SourcePassage
    from dodo.orm.passage_tag import PassageTag
    from dodo.orm.provider import Provider
    from dodo.orm.provider_model import ProviderModel
    from dodo.orm.provider_trace import ProviderTrace
    from dodo.orm.run import Run
    from dodo.orm.sandbox_config import AgentEnvironmentVariable, SandboxConfig, SandboxEnvironmentVariable
    from dodo.orm.tool import Tool
    from dodo.orm.user import User


class Organization(SqlalchemyBase):
    """The highest level of the object tree. All Entities belong to one and only one Organization."""

    __tablename__ = "organizations"
    __pydantic_model__ = PydanticOrganization

    name: Mapped[str] = mapped_column(doc="The display name of the organization.")
    privileged_tools: Mapped[bool] = mapped_column(doc="Whether the organization has access to privileged tools.")

    # relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    tools: Mapped[List["Tool"]] = relationship("Tool", back_populates="organization", cascade="all, delete-orphan")
    mcp_servers: Mapped[List["MCPServer"]] = relationship("MCPServer", back_populates="organization", cascade="all, delete-orphan")
    blocks: Mapped[List["Block"]] = relationship("Block", back_populates="organization", cascade="all, delete-orphan")
    sandbox_configs: Mapped[List["SandboxConfig"]] = relationship(
        "SandboxConfig", back_populates="organization", cascade="all, delete-orphan"
    )
    sandbox_environment_variables: Mapped[List["SandboxEnvironmentVariable"]] = relationship(
        "SandboxEnvironmentVariable", back_populates="organization", cascade="all, delete-orphan"
    )
    agent_environment_variables: Mapped[List["AgentEnvironmentVariable"]] = relationship(
        "AgentEnvironmentVariable", back_populates="organization", cascade="all, delete-orphan"
    )

    # relationships
    agents: Mapped[List["Agent"]] = relationship("Agent", back_populates="organization", cascade="all, delete-orphan")
    sources: Mapped[List["Source"]] = relationship("Source", cascade="all, delete-orphan")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="organization", cascade="all, delete-orphan")
    source_passages: Mapped[List["SourcePassage"]] = relationship(
        "SourcePassage", back_populates="organization", cascade="all, delete-orphan"
    )
    archival_passages: Mapped[List["ArchivalPassage"]] = relationship(
        "ArchivalPassage", back_populates="organization", cascade="all, delete-orphan"
    )
    passage_tags: Mapped[List["PassageTag"]] = relationship("PassageTag", back_populates="organization", cascade="all, delete-orphan")
    archives: Mapped[List["Archive"]] = relationship("Archive", back_populates="organization", cascade="all, delete-orphan")
    providers: Mapped[List["Provider"]] = relationship("Provider", back_populates="organization", cascade="all, delete-orphan")
    provider_models: Mapped[List["ProviderModel"]] = relationship(
        "ProviderModel", back_populates="organization", cascade="all, delete-orphan"
    )
    identities: Mapped[List["Identity"]] = relationship("Identity", back_populates="organization", cascade="all, delete-orphan")
    groups: Mapped[List["Group"]] = relationship("Group", back_populates="organization", cascade="all, delete-orphan")
    llm_batch_jobs: Mapped[List["LLMBatchJob"]] = relationship("LLMBatchJob", back_populates="organization", cascade="all, delete-orphan")
    llm_batch_items: Mapped[List["LLMBatchItem"]] = relationship(
        "LLMBatchItem", back_populates="organization", cascade="all, delete-orphan"
    )
    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="organization", cascade="all, delete-orphan")
    runs: Mapped[List["Run"]] = relationship("Run", back_populates="organization", cascade="all, delete-orphan")
    provider_traces: Mapped[List["ProviderTrace"]] = relationship(
        "ProviderTrace", back_populates="organization", cascade="all, delete-orphan"
    )

