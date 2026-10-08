from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse

security = HTTPBearer(auto_error=False)

DEV_SECRET = "preppilot-dev-secret-key-32chars-min-needed!"
ALGORITHM = "HS256"

# Demo profiles for zero-friction local development and evaluation
DEMO_USERS: Dict[str, Dict[str, Any]] = {
    "candidate": {
        "sub": "mock-candidate-001",
        "email": "candidate@preppilot.com",
        "role": "candidate",
        "full_name": "Demo Candidate (Ananya)",
    },
    "expert": {
        "sub": "mock-expert-002",
        "email": "expert@preppilot.com",
        "role": "expert",
        "full_name": "Demo Expert (Rohit, SDE-2)",
    },
    "admin": {
        "sub": "mock-admin-003",
        "email": "admin@preppilot.com",
        "role": "admin",
        "full_name": "Demo Admin (Platform)",
    },
}

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token for dev/direct authentication."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    secret = settings.SUPABASE_JWT_SECRET if settings.SUPABASE_JWT_SECRET else DEV_SECRET
    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """Verify Supabase JWT token, demo tokens, or dev-generated tokens."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in or provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials.strip()

    # Fast-path 1: Demo / Dev Tokens (e.g., "demo-token-candidate", "demo-candidate")
    for role_key, demo_user in DEMO_USERS.items():
        if token in (f"demo-token-{role_key}", f"demo-{role_key}", f"demo-session-token-{role_key}"):
            return demo_user

    # Legacy demo token fallback
    if token == "demo-session-token-prep-pilot":
        return DEMO_USERS["candidate"]

    # Path 2: Supabase JWT verification (if secret configured)
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=[ALGORITHM],
                options={"verify_aud": False}
            )
            # Supabase stores role and name in user_metadata or app_metadata
            user_meta = payload.get("user_metadata", {})
            app_meta = payload.get("app_metadata", {})
            role = user_meta.get("role") or app_meta.get("role") or payload.get("role") or "candidate"
            full_name = user_meta.get("full_name") or user_meta.get("name") or payload.get("full_name")
            return {
                "sub": payload.get("sub", "unknown_user"),
                "email": payload.get("email", ""),
                "role": role,
                "full_name": full_name,
            }
        except JWTError:
            pass  # Fall through to try DEV_SECRET before rejecting

    # Path 3: Dev Fallback JWT
    try:
        payload = jwt.decode(token, DEV_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    payload: Dict[str, Any] = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """Resolve token payload to current authenticated user and synchronize with DB if available."""
    user_id = payload.get("sub") or payload.get("id", "mock-user-123")
    email = payload.get("email", "candidate@preppilot.com")
    role = payload.get("role", "candidate")
    full_name = payload.get("full_name")

    if not db:
        # Dev mode / no DB connection: return user directly from token payload
        return UserResponse(id=user_id, email=email, role=role, full_name=full_name)

    try:
        # Check if user exists in database
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user and email:
            # Check by email
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

        if not user:
            # Upsert user record into DB
            user = User(id=user_id, email=email, role=role, full_name=full_name)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return UserResponse(
            id=user.id,
            email=user.email,
            role=user.role or role,
            full_name=user.full_name or full_name
        )
    except Exception:
        # Database fallback
        return UserResponse(id=user_id, email=email, role=role, full_name=full_name)

async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[UserResponse]:
    """Optional authentication — returns None if unauthenticated instead of raising 401."""
    if not credentials:
        return None
    try:
        payload = verify_token(credentials)
        return await get_current_user(payload=payload, db=db)
    except HTTPException:
        return None

class RequireRoles:
    """Dependency that ensures the authenticated user has one of the allowed roles."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Role '{current_user.role}' is not authorized. Allowed roles: {', '.join(self.allowed_roles)}",
            )
        return current_user

# Pre-defined role dependencies
require_candidate = RequireRoles(["candidate", "admin"])
require_expert = RequireRoles(["expert", "admin"])
require_admin = RequireRoles(["admin"])
require_authenticated = RequireRoles(["candidate", "expert", "admin"])

