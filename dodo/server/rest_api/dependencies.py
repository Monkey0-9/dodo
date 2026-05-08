from typing import TYPE_CHECKING, Optional

from fastapi import Header
from pydantic import BaseModel

from dodo.errors import dodoInvalidArgumentError
from dodo.otel.tracing import tracer
from dodo.schemas.enums import PrimitiveType
from dodo.schemas.provider_trace import BillingContext
from dodo.validators import PRIMITIVE_ID_PATTERNS

if TYPE_CHECKING:
    from dodo.server.server import SyncServer


class ExperimentalParams(BaseModel):
    """Experimental parameters used across REST API endpoints."""

    message_async: Optional[bool] = None
    dodo_v1_agent: Optional[bool] = None
    dodo_v1_agent_message_async: Optional[bool] = None
    modal_sandbox: Optional[bool] = None
    openai_responses_websocket: Optional[bool] = None


class HeaderParams(BaseModel):
    """Common header parameters used across REST API endpoints."""

    actor_id: Optional[str] = None
    user_agent: Optional[str] = None
    project_id: Optional[str] = None
    dodo_source: Optional[str] = None
    sdk_version: Optional[str] = None
    experimental_params: Optional[ExperimentalParams] = None
    billing_context: Optional[BillingContext] = None


def get_headers(
    actor_id: Optional[str] = Header(None, alias="user_id"),
    user_agent: Optional[str] = Header(None, alias="User-Agent"),
    project_id: Optional[str] = Header(None, alias="X-Project-Id"),
    dodo_source: Optional[str] = Header(None, alias="X-dodo-Source", include_in_schema=False),
    sdk_version: Optional[str] = Header(None, alias="X-Stainless-Package-Version", include_in_schema=False),
    message_async: Optional[str] = Header(None, alias="X-Experimental-Message-Async", include_in_schema=False),
    dodo_v1_agent: Optional[str] = Header(None, alias="X-Experimental-dodo-V1-Agent", include_in_schema=False),
    dodo_v1_agent_message_async: Optional[str] = Header(
        None, alias="X-Experimental-dodo-V1-Agent-Message-Async", include_in_schema=False
    ),
    modal_sandbox: Optional[str] = Header(None, alias="X-Experimental-Modal-Sandbox", include_in_schema=False),
    openai_responses_websocket: Optional[str] = Header(None, alias="X-Experimental-OpenAI-Responses-Websocket", include_in_schema=False),
    billing_plan_type: Optional[str] = Header(None, alias="X-Billing-Plan-Type", include_in_schema=False),
    billing_cost_source: Optional[str] = Header(None, alias="X-Billing-Cost-Source", include_in_schema=False),
    billing_customer_id: Optional[str] = Header(None, alias="X-Billing-Customer-Id", include_in_schema=False),
) -> HeaderParams:
    """Dependency injection function to extract common headers from requests."""
    with tracer.start_as_current_span("dependency.get_headers"):
        if actor_id is not None and PRIMITIVE_ID_PATTERNS[PrimitiveType.USER.value].match(actor_id) is None:
            raise dodoInvalidArgumentError(
                message=(f"Invalid user ID format: {actor_id}. Expected format: '{PrimitiveType.USER.value}-<uuid4>'"),
                argument_name="user_id",
            )

        return HeaderParams(
            actor_id=actor_id,
            user_agent=user_agent,
            project_id=project_id,
            dodo_source=dodo_source,
            sdk_version=sdk_version,
            experimental_params=ExperimentalParams(
                message_async=(message_async == "true") if message_async else None,
                dodo_v1_agent=(dodo_v1_agent == "true") if dodo_v1_agent else None,
                dodo_v1_agent_message_async=(dodo_v1_agent_message_async == "true") if dodo_v1_agent_message_async else None,
                modal_sandbox=(modal_sandbox == "true") if modal_sandbox else None,
                openai_responses_websocket=(openai_responses_websocket == "true") if openai_responses_websocket else None,
            ),
            billing_context=BillingContext(
                plan_type=billing_plan_type,
                cost_source=billing_cost_source,
                customer_id=billing_customer_id,
            )
            if any([billing_plan_type, billing_cost_source, billing_customer_id])
            else None,
        )


# TODO: why does this double up the interface?
async def get_dodo_server() -> "SyncServer":
    with tracer.start_as_current_span("dependency.get_dodo_server"):
        # Check if a global server is already instantiated
        from dodo.server.rest_api.app import server

        # assert isinstance(server, SyncServer)
        return server

