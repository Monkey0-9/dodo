from typing import Any, Literal

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict, Field

from dodo.errors import dodoInvalidArgumentError
from dodo.helpers.tpuf_client import TurbopufferClient, should_use_tpuf_for_messages
from dodo.server.rest_api.dependencies import HeaderParams, get_headers, get_dodo_server
from dodo.server.server import SyncServer

router = APIRouter(prefix="/_internal_search", tags=["_internal_search"])


class MessageSearchCacheWarmScope(BaseModel):
    """Messages currently infer scope from the authenticated actor."""

    model_config = ConfigDict(extra="forbid")


class SearchCacheWarmRequest(BaseModel):
    """Request for warming an internal search cache."""

    model_config = ConfigDict(extra="forbid")

    collection: Literal["messages"] = Field(description="Embedded collection whose cache should be warmed.")
    scope: MessageSearchCacheWarmScope = Field(
        description="Collection-specific scope. Messages currently infer organization from the authenticated actor.",
    )


class SearchCacheWarmResponse(BaseModel):
    """Response for internal search cache warming."""

    collection: Literal["messages"]
    status: str
    warmed: bool


_COLLECTION_FEATURE_CHECKS = {
    "messages": should_use_tpuf_for_messages,
}

_COLLECTION_ERROR_MESSAGES = {
    "messages": "Message cache warming requires message embedding, OpenAI, and Turbopuffer to be enabled.",
}


def _resolve_cache_warm_scope(request: SearchCacheWarmRequest, actor: Any) -> dict[str, str]:
    if request.collection == "messages":
        return {"organization_id": actor.organization_id}

    raise dodoInvalidArgumentError(
        f"Unsupported cache warm collection: {request.collection}",
        argument_name="collection",
    )


@router.post("/cache-warm", response_model=SearchCacheWarmResponse, status_code=202, operation_id="warm_internal_search_cache")
async def warm_search_cache(
    request: SearchCacheWarmRequest = Body(...),
    server: SyncServer = Depends(get_dodo_server),
    headers: HeaderParams = Depends(get_headers),
):
    """Warm the cache for a supported internal search collection."""
    if not _COLLECTION_FEATURE_CHECKS[request.collection]():
        raise dodoInvalidArgumentError(
            _COLLECTION_ERROR_MESSAGES[request.collection],
            argument_name="collection",
        )

    actor = await server.user_manager.get_actor_or_default_async(actor_id=headers.actor_id)
    result = await TurbopufferClient().hint_cache_warm(
        collection=request.collection,
        scope=_resolve_cache_warm_scope(request, actor),
    )

    return SearchCacheWarmResponse(collection=request.collection, status=result["status"], warmed=True)

