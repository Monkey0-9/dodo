from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from dodo.server.server import SyncServer

_server: Optional["SyncServer"] = None

def get_server() -> "SyncServer":
    global _server
    if _server is None:
        from dodo.server.rest_api.interface import StreamingServerInterface
        from dodo.server.server import SyncServer
        _server = SyncServer(default_interface_factory=lambda: StreamingServerInterface())
    return _server

def set_server(server: "SyncServer"):
    global _server
    _server = server
