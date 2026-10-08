from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    CANDIDATE = "candidate"
    EXPERT = "expert"
    ADMIN = "admin"

class UserCreate(BaseModel):
    email: str
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = UserRole.CANDIDATE.value

class UserResponse(BaseModel):
    id: str
    email: str
    role: str = "candidate"
    full_name: Optional[str] = None
    created_at: Optional[str] = None

class ProfileUpdate(BaseModel):
    target_role: Optional[str] = None
    bio: Optional[str] = None
    resume_url: Optional[str] = None

class CandidateProfileResponse(BaseModel):
    user_id: str
    target_role: Optional[str] = None
    bio: Optional[str] = None
    resume_url: Optional[str] = None

class ExpertProfileUpdate(BaseModel):
    domains: Optional[str] = None
    bio: Optional[str] = None
    company_title: Optional[str] = None

class ExpertProfileResponse(BaseModel):
    user_id: str
    domains: Optional[str] = None
    bio: Optional[str] = None
    company_title: Optional[str] = None
    approved: bool = False
    avg_rating: float = 0.0

class RoleChangeRequest(BaseModel):
    user_id: str
    new_role: str

class ExpertApprovalRequest(BaseModel):
    user_id: str
    approved: bool = True

