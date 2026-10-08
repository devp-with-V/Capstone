from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, Literal
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user, DEMO_USERS
from app.schemas.common import APIResponse, APIError
from app.schemas.user import UserCreate, UserResponse, UserRole
from app.services.user_service import user_service

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class DemoLoginRequest(BaseModel):
    role: Literal["candidate", "expert", "admin"] = "candidate"

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
        user = await user_service.get_by_email(db, login_in.email)
        if not user:
            # For development ease, if user is not found, automatically register as candidate
            user = await user_service.create_user(db, UserCreate(
                email=login_in.email,
                full_name=login_in.email.split("@")[0].capitalize(),
                role=UserRole.CANDIDATE.value
            ))

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

@router.post("/demo-login", response_model=APIResponse[AuthResponse])
async def demo_login(req: DemoLoginRequest):
    """Instantly authenticate as Candidate, Expert, or Admin for zero-friction evaluation."""
    demo_data = DEMO_USERS.get(req.role, DEMO_USERS["candidate"])
    token = f"demo-token-{req.role}"
    user_resp = UserResponse(
        id=demo_data["sub"],
        email=demo_data["email"],
        role=demo_data["role"],
        full_name=demo_data["full_name"]
    )
    return APIResponse(data=AuthResponse(token=token, user=user_resp))

@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Return profile and role of currently authenticated user."""
    return APIResponse(data=current_user)


