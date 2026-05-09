import json
from datetime import datetime

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from dodo.log import get_logger
from dodo.schemas.enums import MessageRole
from dodo.schemas.message import MessageCreate
from dodo.schemas.dodo_request import dodoStreamingRequest
from dodo.server.rest_api.dependencies import get_dodo_server
from dodo.server.server import SyncServer
from dodo.services.streaming_service import StreamingService

logger = get_logger(__name__)

router = APIRouter(prefix="/portal", tags=["portal"])

@router.websocket("/stream/{agent_id}")
async def portal_agent_stream(
    websocket: WebSocket,
    agent_id: str,
    server: SyncServer = Depends(get_dodo_server),
):
    """
    WebSocket endpoint for real-time agent interaction in the Dodo Portal.
    Allows for bidirectional communication and token-by-token streaming.
    """
    await websocket.accept()
    logger.info(f"Portal WebSocket connection established for agent: {agent_id}")
    
    try:
        while True:
            # Receive message from the portal
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON payload"}))
                continue
            
            message_type = payload.get("type")
            
            if message_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.utcnow().isoformat()}))
                continue
                
            if message_type == "message":
                content = payload.get("content")
                actor_id = payload.get("actor_id", "default_actor")
                
                if not content:
                    await websocket.send_text(json.dumps({"error": "Message content is required"}))
                    continue
                
                actor = await server.user_manager.get_actor_or_default_async(actor_id=actor_id)
                
                # Initialize streaming request
                request = dodoStreamingRequest(
                    messages=[MessageCreate(role=MessageRole.user, content=content)],
                    stream_tokens=True,
                    include_pings=True
                )
                
                streaming_service = StreamingService(server)
                
                # Note: We use the existing streaming infrastructure but bridge it to WebSocket
                run, response = await streaming_service.create_agent_stream(
                    agent_id=agent_id,
                    actor=actor,
                    request=request,
                    run_type="portal_chat"
                )
                
                # Stream the response chunks back to the WebSocket
                if hasattr(response, "body_iterator"):
                    async for chunk in response.body_iterator:
                        if isinstance(chunk, bytes):
                            chunk_str = chunk.decode("utf-8")
                        else:
                            chunk_str = chunk
                            
                        # Send the raw SSE formatted chunk or parse and send as JSON?
                        # For the portal, we'll send the raw SSE chunks and let the frontend handle them,
                        # or we can wrap them in a JSON envelope.
                        await websocket.send_text(chunk_str)
                else:
                    # Non-streaming response fallback (should not happen with stream_tokens=True)
                    await websocket.send_text(json.dumps({"type": "error", "message": "Failed to initialize stream"}))
            
            else:
                await websocket.send_text(json.dumps({"type": "error", "message": f"Unknown message type: {message_type}"}))

    except WebSocketDisconnect:
        logger.info(f"Portal WebSocket disconnected for agent: {agent_id}")
    except Exception as e:
        logger.exception(f"Error in Portal WebSocket stream: {e}")
        try:
            await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
        except:
            pass
