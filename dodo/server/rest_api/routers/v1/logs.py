import asyncio
import json
import logging
from typing import Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/logs", tags=["logs"])

class WebSocketLogHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.queues: Set[asyncio.Queue] = set()

    def emit(self, record):
        try:
            log_entry = self.format(record)
            # Find the running event loop and put it in all queues
            try:
                loop = asyncio.get_running_loop()
                for queue in self.queues:
                    loop.call_soon_threadsafe(queue.put_nowait, log_entry)
            except RuntimeError:
                # No running event loop (e.g. during shutdown or startup)
                pass
        except Exception:
            self.handleError(record)

# Singleton handler
log_handler = WebSocketLogHandler()
log_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logging.getLogger("dodo").addHandler(log_handler)

@router.websocket("/stream")
async def stream_logs(websocket: WebSocket):
    await websocket.accept()
    queue = asyncio.Queue()
    log_handler.queues.add(queue)

    try:
        while True:
            log_entry = await queue.get()
            # Parse simple string log to structured JSON for the portal
            # Example: 2024-05-20 14:20:46,882 - dodo.module - INFO - Message
            parts = log_entry.split(' - ', 3)
            if len(parts) == 4:
                structured_log = {
                    "time": parts[0],
                    "source": parts[1],
                    "level": parts[2],
                    "message": parts[3]
                }
            else:
                structured_log = {
                    "time": "",
                    "source": "SYSTEM",
                    "level": "INFO",
                    "message": log_entry
                }

            await websocket.send_text(json.dumps(structured_log))
    except WebSocketDisconnect:
        pass
    finally:
        log_handler.queues.remove(queue)
