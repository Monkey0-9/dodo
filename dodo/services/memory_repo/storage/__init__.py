"""Storage backends for memory repositories."""

from dodo.services.memory_repo.storage.base import StorageBackend
from dodo.services.memory_repo.storage.local import LocalStorageBackend

__all__ = [
    "LocalStorageBackend",
    "StorageBackend",
]

