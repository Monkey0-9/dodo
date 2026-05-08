import uuid
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from dodo.orm.agent import Agent
    from dodo.orm.block import Block
    from dodo.orm.organization import Organization

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from dodo.orm.mixins import OrganizationMixin, ProjectMixin, TemplateMixin
from dodo.orm.sqlalchemy_base import SqlalchemyBase
from dodo.schemas.group import Group as PydanticGroup


class Group(SqlalchemyBase, OrganizationMixin, ProjectMixin, TemplateMixin):
    __tablename__ = "groups"
    __pydantic_model__ = PydanticGroup

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"group-{uuid.uuid4()}")
    description: Mapped[str] = mapped_column(nullable=False, doc="")
    manager_type: Mapped[str] = mapped_column(nullable=False, doc="")
    manager_agent_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("agents.id", ondelete="RESTRICT"), nullable=True, doc="")
    termination_token: Mapped[Optional[str]] = mapped_column(nullable=True, doc="")
    max_turns: Mapped[Optional[int]] = mapped_column(nullable=True, doc="")
    sleeptime_agent_frequency: Mapped[Optional[int]] = mapped_column(nullable=True, doc="")
    max_message_buffer_length: Mapped[Optional[int]] = mapped_column(nullable=True, doc="")
    min_message_buffer_length: Mapped[Optional[int]] = mapped_column(nullable=True, doc="")
    turns_counter: Mapped[Optional[int]] = mapped_column(nullable=True, doc="")
    last_processed_message_id: Mapped[Optional[str]] = mapped_column(nullable=True, doc="")
    hidden: Mapped[Optional[bool]] = mapped_column(nullable=True, doc="If set to True, the group will be hidden.")

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="groups")
    agent_ids: Mapped[List[str]] = mapped_column(JSON, nullable=False, doc="Ordered list of agent IDs in this group")
    agents: Mapped[List["Agent"]] = relationship(
        "Agent", secondary="groups_agents", lazy="selectin", passive_deletes=True, back_populates="groups"
    )
    shared_blocks: Mapped[List["Block"]] = relationship(
        "Block", secondary="groups_blocks", lazy="selectin", passive_deletes=True, back_populates="groups"
    )
    manager_agent: Mapped["Agent"] = relationship("Agent", lazy="joined", back_populates="multi_agent_group")

