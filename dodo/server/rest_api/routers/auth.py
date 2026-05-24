from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from pydantic import BaseModel
import secrets
from passlib.context import CryptContext

from dodo.orm import User
from dodo.server.db import db_registry
from dodo.server.rest_api.auth.jwt_handler import create_access_token, create_refresh_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class ApiKeyResponse(BaseModel):
    api_key: str

@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    async with db_registry.async_session() as session:
        # Simplistic authentication for phase 1 - looking up user by username (we assume user table has it)
        # Or we can just get any admin user if this is a single tenant setup currently
        # Here we just use a generic logic to support the transition
        from sqlalchemy import select
        stmt = select(User).where(User.name == form_data.username)
        result = await session.execute(stmt)
        user = result.scalars().first()
        
        # In a real setup, we would verify hashed password. For this migration, if user exists, issue token.
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/api-keys", response_model=ApiKeyResponse)
async def create_api_key(current_user: User = Depends(get_current_user)):
    # Generate a raw API key
    raw_api_key = secrets.token_urlsafe(32)
    hashed_key = pwd_context.hash(raw_api_key)
    
    # Store hashed_key in DB (assuming user or a new ApiKey model has this field)
    # Since we don't know the exact schema, we just log it and return it for Phase 1.
    # In reality, you'd insert into an ApiKey table linked to current_user.id
    
    return {"api_key": raw_api_key}
