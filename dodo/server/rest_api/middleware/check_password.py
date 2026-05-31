from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from dodo.server.rest_api.auth.jwt_handler import SECRET_KEY, ALGORITHM
import jwt
from jwt import PyJWTError as JWTError

class CheckPasswordMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, password: str):
        super().__init__(app)
        self.password = password

    async def dispatch(self, request, call_next):
        # Exclude health/readiness and auth endpoints
        if request.url.path in {
            "/v1/health",
            "/v1/health/",
            "/v1/ready",
            "/v1/ready/",
            "/v1/auth/login",
            "/v1/auth/login/",
            "/openapi.json",
            "/docs",
        } or request.url.path.startswith("/v1/auth"):
            return await call_next(request)

        # Priority 1: JWT Bearer Token
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        elif "token" in request.query_params:
            token = request.query_params["token"]

        if token:
            try:
                jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                return await call_next(request)
            except JWTError:
                pass # Fall through to P2 or fail

        # Priority 2: Legacy Bare Password removed for security.
        pass

        return JSONResponse(
            content={"detail": "Unauthorized. Please login at /v1/auth/login"},
            status_code=401,
        )
