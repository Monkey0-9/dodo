import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status, Request, WebSocket
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "15"))

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/v1/auth/login", auto_error=False
)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    request: Request = None,
    websocket: WebSocket = None,
):
    """Dependency injection to get the current user from JWT, supporting HTTP and WebSocket."""
    from dodo.settings import settings
    if settings.debug:
        from dodo.schemas.user import User as PydanticUser
        return PydanticUser(
            id="user-00000000-0000-0000-0000-000000000000",
            name="Default Admin",
            organization_id="org-00000000-0000-0000-0000-000000000000"
        )

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

    # Development-friendly authentication bypass
    bypass_password = os.getenv("DODO_SERVER_PASSWORD", "dodo-secret")
    if token == bypass_password:
        from dodo.schemas.user import User as PydanticUser
        return PydanticUser(
            id="user-00000000-0000-0000-0000-000000000000",
            name="Default Admin",
            organization_id="org-00000000-0000-0000-0000-000000000000"
        )

    try:
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
                user_id == "user-00000000-0000-0000-0000-000000000000"
            )
            if is_fallback:
                from dodo.schemas.user import User as PydanticUser
                return PydanticUser(
                    id="user-00000000-0000-0000-0000-000000000000",
                    name="Default Admin",
                    organization_id="org-00000000-0000-0000-0000-000000000000"
                )
            raise credentials_exception
        return user
