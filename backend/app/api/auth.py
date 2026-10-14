from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user
from app.schemas.common import APIResponse, APIError
from app.schemas.user import UserCreate, UserResponse, UserRole
from app.services.user_service import user_service

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

@router.post("/signup", response_model=APIResponse[AuthResponse])
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Validate role
        if user_in.role not in [UserRole.CANDIDATE.value, UserRole.EXPERT.value]:
            user_in.role = UserRole.CANDIDATE.value

        # Check existing
        existing = await user_service.get_by_email(db, user_in.email)
        if existing:
            return APIResponse(error=APIError(message=f"An account with email {user_in.email} already exists. Please log in."))

        user = await user_service.create_user(db, user_in)
        token = create_access_token({
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        })

        user_resp = UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            full_name=user.full_name
        )

        return APIResponse(data=AuthResponse(token=token, user=user_resp))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

@router.post("/login", response_model=APIResponse[AuthResponse])
async def login(login_in: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        from app.core.hashing import verify_password
        user = await user_service.get_by_email(db, login_in.email)
        
        if not user or not user.hashed_password:
            return APIResponse(error=APIError(message="Invalid email or password."))

        if not verify_password(login_in.password, user.hashed_password):
            return APIResponse(error=APIError(message="Invalid email or password."))

        token = create_access_token({
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        })

        user_resp = UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            full_name=user.full_name
        )

        return APIResponse(data=AuthResponse(token=token, user=user_resp))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Return profile and role of currently authenticated user."""
    return APIResponse(data=current_user)


