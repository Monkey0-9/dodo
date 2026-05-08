from typing import Literal

from pydantic import Field

from dodo.constants import DEFAULT_EMBEDDING_CHUNK_SIZE, dodo_MODEL_ENDPOINT
from dodo.schemas.embedding_config import EmbeddingConfig
from dodo.schemas.enums import ProviderCategory, ProviderType
from dodo.schemas.llm_config import LLMConfig
from dodo.schemas.providers.base import Provider

dodo_EMBEDDING_ENDPOINT = "https://embeddings.dodo.com/"


class dodoProvider(Provider):
    provider_type: Literal[ProviderType.dodo] = Field(ProviderType.dodo, description="The type of the provider.")
    provider_category: ProviderCategory = Field(ProviderCategory.base, description="The category of the provider (base or byok)")
    base_url: str = Field(dodo_EMBEDDING_ENDPOINT, description="Base URL for the dodo API (used for embeddings).")

    async def list_llm_models_async(self) -> list[LLMConfig]:
        return [
            LLMConfig(
                model="dodo-free",  # NOTE: renamed
                model_endpoint_type="openai",
                model_endpoint=dodo_MODEL_ENDPOINT,
                context_window=30000,
                handle=self.get_handle("dodo-free"),
                max_tokens=self.get_default_max_output_tokens("dodo-free"),
                provider_name=self.name,
                provider_category=self.provider_category,
            )
        ]

    async def list_embedding_models_async(self):
        return [
            EmbeddingConfig(
                embedding_model="dodo-free",  # NOTE: renamed
                embedding_endpoint_type="openai",
                embedding_endpoint=self.base_url,
                embedding_dim=1536,
                embedding_chunk_size=DEFAULT_EMBEDDING_CHUNK_SIZE,
                handle=self.get_handle("dodo-free", is_embedding=True),
            )
        ]

