from datetime import datetime
from typing import Optional

from pydantic import Field

from dodo.helpers.datetime_helpers import get_utc_time
from dodo.schemas.enums import PrimitiveType
from dodo.schemas.dodo_base import dodoBase
from dodo.utils import create_random_username


class OrganizationBase(dodoBase):
    __id_prefix__ = PrimitiveType.ORGANIZATION.value


class Organization(OrganizationBase):
    id: str = OrganizationBase.generate_id_field()
    name: str = Field(create_random_username(), description="The name of the organization.", json_schema_extra={"default": "SincereYogurt"})
    created_at: Optional[datetime] = Field(default_factory=get_utc_time, description="The creation date of the organization.")
    privileged_tools: bool = Field(False, description="Whether the organization has access to privileged tools.")


class OrganizationCreate(OrganizationBase):
    name: Optional[str] = Field(None, description="The name of the organization.")
    privileged_tools: Optional[bool] = Field(False, description="Whether the organization has access to privileged tools.")


class OrganizationUpdate(OrganizationBase):
    name: Optional[str] = Field(None, description="The name of the organization.")
    privileged_tools: Optional[bool] = Field(False, description="Whether the organization has access to privileged tools.")

