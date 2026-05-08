"""Git-based memory repository services."""

from dodo.services.memory_repo.storage.base import StorageBackend
from dodo.services.memory_repo.storage.local import LocalStorageBackend

# MemfsClient: try cloud implementation first, fall back to local filesystem
try:
    from dodo.services.memory_repo.memfs_client import MemfsClient
except ImportError:
    from dodo.services.memory_repo.memfs_client_base import MemfsClient

__all__ = [
    "LocalStorageBackend",
    "MemfsClient",
    "StorageBackend",
]

