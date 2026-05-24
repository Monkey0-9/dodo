import os
from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

def mount_static_files(app: FastAPI):
    # Path to the built frontend
    portal_dist = os.path.join(os.getcwd(), "dodo_portal", "dist")
    
    if os.path.exists(portal_dist):
        # Serve static assets
        app.mount("/assets", StaticFiles(directory=os.path.join(portal_dist, "assets")), name="assets")
        
        @app.get("/", include_in_schema=False)
        async def serve_portal():
            return FileResponse(os.path.join(portal_dist, "index.html"))
            
        @app.get("/{full_path:path}", include_in_schema=False)
        async def serve_portal_fallback(full_path: str):
            # If not an API call and not a specific file, serve index.html for SPA routing
            if full_path.startswith("v1") or full_path.startswith("docs") or full_path.startswith("admin") or full_path.startswith("api"):
                from fastapi import HTTPException
                raise HTTPException(status_code=404)
            
            return FileResponse(os.path.join(portal_dist, "index.html"))
    else:
        @app.get("/", include_in_schema=False)
        async def redirect_to_docs():
            return RedirectResponse(url="/docs")
