from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user, require_candidate, require_expert, require_admin
from app.schemas.common import APIResponse, APIError
from app.schemas.user import (
    UserResponse,
    ProfileUpdate,
    CandidateProfileResponse,
    ExpertProfileUpdate,
    ExpertProfileResponse,
    RoleChangeRequest,
    ExpertApprovalRequest,
)
from app.services.user_service import user_service

router = APIRouter()

# -------------------------------------------------------------
# Candidate Profile Endpoints (Authenticated Candidate or Admin)
# -------------------------------------------------------------

@router.get("/profile", response_model=APIResponse[CandidateProfileResponse])
async def get_profile(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        profile = await user_service.get_candidate_profile(db, current_user.id)
        if not profile:
            return APIResponse(data=CandidateProfileResponse(
                user_id=current_user.id,
                target_role="Software Engineer",
                bio="Candidate preparing for tech interviews"
            ))
        return APIResponse(data=CandidateProfileResponse(
            user_id=profile.user_id,
            target_role=profile.target_role,
            bio=profile.bio,
            resume_url=profile.resume_url
        ))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

@router.put("/profile", response_model=APIResponse[CandidateProfileResponse])
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        profile = await user_service.update_candidate_profile(db, current_user.id, profile_in)
        return APIResponse(data=CandidateProfileResponse(
            user_id=profile.user_id,
            target_role=profile.target_role,
            bio=profile.bio,
            resume_url=profile.resume_url
        ))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

# -------------------------------------------------------------
# Expert Endpoints (Guarded by require_expert)
# -------------------------------------------------------------

@router.get("/expert/profile", response_model=APIResponse[ExpertProfileResponse])
async def get_expert_profile(
    current_user: UserResponse = Depends(require_expert),
    db: AsyncSession = Depends(get_db)
):
    try:
        profile = await user_service.get_expert_profile(db, current_user.id)
        if not profile:
            return APIResponse(data=ExpertProfileResponse(
                user_id=current_user.id,
                domains="Algorithms, System Design",
                company_title="Senior Engineer",
                bio="Interview mentor",
                approved=True,
                avg_rating=4.9
            ))
        return APIResponse(data=ExpertProfileResponse(
            user_id=profile.user_id,
            domains=profile.domains,
            bio=profile.bio,
            company_title=profile.company_title,
            approved=profile.approved,
            avg_rating=profile.avg_rating
        ))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

@router.put("/expert/profile", response_model=APIResponse[ExpertProfileResponse])
async def update_expert_profile(
    profile_in: ExpertProfileUpdate,
    current_user: UserResponse = Depends(require_expert),
    db: AsyncSession = Depends(get_db)
):
    try:
        profile = await user_service.update_expert_profile(db, current_user.id, profile_in)
        return APIResponse(data=ExpertProfileResponse(
            user_id=profile.user_id,
            domains=profile.domains,
            bio=profile.bio,
            company_title=profile.company_title,
            approved=profile.approved,
            avg_rating=profile.avg_rating
        ))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

# -------------------------------------------------------------
# Admin Endpoints (Guarded by require_admin)
# -------------------------------------------------------------

@router.get("/admin/users", response_model=APIResponse[List[UserResponse]])
async def list_all_users(
    _admin: UserResponse = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only: Retrieve all users and their respective roles."""
    try:
        users = await user_service.list_users(db)
        return APIResponse(data=users)
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

@router.post("/admin/change-role", response_model=APIResponse[UserResponse])
async def change_user_role(
    req: RoleChangeRequest,
    _admin: UserResponse = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only: Update a user's role (candidate, expert, admin)."""
    try:
        updated = await user_service.update_user_role(db, req.user_id, req.new_role)
        if not updated:
            return APIResponse(error=APIError(message=f"User with ID {req.user_id} not found."))
        return APIResponse(data=updated)
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))

@router.post("/admin/approve-expert", response_model=APIResponse[dict])
async def approve_expert_application(
    req: ExpertApprovalRequest,
    _admin: UserResponse = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only: Approve or reject an expert's application."""
    try:
        success = await user_service.approve_expert(db, req.user_id, req.approved)
        if not success:
            return APIResponse(error=APIError(message=f"Expert with ID {req.user_id} not found."))
        return APIResponse(data={"user_id": req.user_id, "approved": req.approved, "message": "Expert status updated."})
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))


