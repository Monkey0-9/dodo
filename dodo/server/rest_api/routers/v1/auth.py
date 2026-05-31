from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from dodo.log import get_logger
from dodo.server.rest_api.auth.jwt_handler import create_access_token

logger = get_logger(__name__)
import os

router = APIRouter(prefix="/auth", tags=["auth"])

import secrets
import warnings

_master = os.getenv("DODO_SERVER_PASSWORD")
if not _master:
    warnings.warn(
        "DODO_SERVER_PASSWORD environment variable is not set. Generating a temporary random password for this session."
    )
    _master = secrets.token_urlsafe(16)

MASTER_PASSWORD = _master

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # For now, we validate against the master password to satisfy Phase 1 requirement
    # while moving to JWT. In a full production system, this would check against
    # the User table's hashed_password.
    if form_data.password != MASTER_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create a JWT for the "admin" user
    # In a real system, we'd fetch the user from the DB here.
    access_token = create_access_token(data={"sub": "user-default-admin"})
    return {"access_token": access_token, "token_type": "bearer"}
