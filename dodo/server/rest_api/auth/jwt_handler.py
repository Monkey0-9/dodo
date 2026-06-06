import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import HTTPException, Request, WebSocket, status
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError as JWTError

_secret = os.getenv("JWT_SECRET")
if not _secret:
    raise RuntimeError("JWT_SECRET environment variable is not set.")

SECRET_KEY = _secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "15"))

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/v1/auth/login", auto_error=False
)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    request: Request = None,
    websocket: WebSocket = None,
):
    """Dependency injection to get the current user from JWT.

    Supports HTTP and WebSocket connections.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    connection = request or websocket
    if connection is None:
        raise credentials_exception

    token = None
    authorization = connection.headers.get("Authorization")
    if authorization:
        scheme, _, param = authorization.partition(" ")
        if scheme.lower() == "bearer":
            token = param
    else:
        # Check query parameters (e.g. for WebSockets)
        token = connection.query_params.get("token")

    if not token:
        raise credentials_exception

    try:
        # Blacklist 'none' algorithm
        unverified_header = jwt.get_unverified_header(token)
        if unverified_header.get("alg", "").lower() == "none":
            raise credentials_exception

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from dodo.orm import User
    from dodo.server.db import db_registry

    async with db_registry.async_session() as session:
        user = await session.get(User, user_id)
        if user is None:
            # Fallback for default system user
            is_fallback = (
                user_id == "user-default-admin" or
                user_id == "user-00000000-0000-4000-8000-000000000000"
            )
            if is_fallback:
                from dodo.schemas.user import User as PydanticUser
                return PydanticUser(
                    id="user-00000000-0000-4000-8000-000000000000",
                    name="Default Admin",
                    organization_id="org-00000000-0000-4000-8000-000000000000"
                )
            raise credentials_exception
        return user
