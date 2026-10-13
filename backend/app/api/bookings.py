from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.booking import ExpertProfile
from app.schemas.booking import BookingCreate, BookingResponse, ExpertSummary, SlotCreate, SlotResponse
from app.schemas.common import APIResponse
from app.services.booking_service import booking_service

from app.core.security import get_optional_current_user
from app.schemas.user import UserResponse

router = APIRouter()


def expert_response(expert: ExpertProfile) -> ExpertSummary:
    return ExpertSummary(
        id=expert.id, display_name=expert.display_name, headline=expert.headline,
        company=expert.company, bio=expert.bio,
        domains=[domain.strip() for domain in expert.domains.split(",") if domain.strip()],
        years_experience=expert.years_experience,
    )


@router.get("/experts", response_model=APIResponse[list[ExpertSummary]])
async def list_experts(domain: str | None = Query(default=None), db: AsyncSession = Depends(get_db)):
    if db is None:
        return APIResponse(data=[])
    return APIResponse(data=[expert_response(item) for item in await booking_service.list_experts(db, domain)])

@router.get("/experts/me")
async def get_my_expert(
    current_user: UserResponse | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Please log in.")

    if db is None:
        raise HTTPException(status_code=503, detail="Booking storage is not configured.")

    from sqlalchemy import select
    from app.models.booking import ExpertProfile

    expert = await db.scalar(
        select(ExpertProfile).where(
            ExpertProfile.user_id == current_user.id
        )
    )

    if expert is None:
        raise HTTPException(status_code=404, detail="Expert profile not found.")

    return APIResponse(data={"id": expert.id})



@router.get("/experts/{expert_id}/slots", response_model=APIResponse[list[SlotResponse]])
async def list_slots(expert_id: str, db: AsyncSession = Depends(get_db)):
    if db is None:
        return APIResponse(data=[])
    return APIResponse(data=[SlotResponse.model_validate(item, from_attributes=True) for item in await booking_service.list_slots(db, expert_id)])


@router.post("/experts/{expert_id}/slots", response_model=APIResponse[SlotResponse])
async def create_slot(expert_id: str, payload: SlotCreate, db: AsyncSession = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=503, detail="Booking storage is not configured.")
    slot = await booking_service.create_slot(db, expert_id, payload.start_time, payload.end_time)
    return APIResponse(data=SlotResponse.model_validate(slot, from_attributes=True))

@router.delete("/experts/{expert_id}/slots/{slot_id}")
async def delete_slot(
    expert_id: str,
    slot_id: str,
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Booking storage is not configured.",
        )

    try:
        await booking_service.delete_slot(db, expert_id, slot_id)
    except ValueError as error:
        status_code = 409 if "booked" in str(error).lower() else 404
        raise HTTPException(
            status_code=status_code,
            detail=str(error),
        ) from error

    return APIResponse(data={"message": "Availability slot removed successfully."})



@router.post("/bookings", response_model=APIResponse[BookingResponse], status_code=201)
async def create_booking(
    payload: BookingCreate,
    candidate_id: str = Query(default="mock-candidate-123"),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    if db is None:
        raise HTTPException(status_code=503, detail="Booking storage is not configured.")
    effective_candidate_id = current_user.id if current_user else candidate_id
    try:
        booking = await booking_service.book_slot(db, effective_candidate_id, payload.slot_id, payload.agenda)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return APIResponse(data=BookingResponse.model_validate(booking, from_attributes=True))


@router.get("/bookings", response_model=APIResponse[list[BookingResponse]])
async def list_bookings(
    candidate_id: str = Query(default="mock-candidate-123"),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    if db is None:
        return APIResponse(data=[])
    effective_candidate_id = current_user.id if current_user else candidate_id
    bookings = await booking_service.list_candidate_bookings(db, effective_candidate_id)
    return APIResponse(data=[BookingResponse.model_validate(item, from_attributes=True) for item in bookings])
