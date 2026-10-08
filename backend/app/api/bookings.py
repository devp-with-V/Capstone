from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.booking import ExpertProfile
from app.schemas.booking import BookingCreate, BookingResponse, ExpertSummary, SlotCreate, SlotResponse
from app.schemas.common import APIResponse
from app.services.booking_service import booking_service

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


@router.post("/bookings", response_model=APIResponse[BookingResponse], status_code=201)
async def create_booking(payload: BookingCreate, candidate_id: str = Query(default="mock-candidate-123"), db: AsyncSession = Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=503, detail="Booking storage is not configured.")
    try:
        booking = await booking_service.book_slot(db, candidate_id, payload.slot_id, payload.agenda)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return APIResponse(data=BookingResponse.model_validate(booking, from_attributes=True))


@router.get("/bookings", response_model=APIResponse[list[BookingResponse]])
async def list_bookings(candidate_id: str = Query(default="mock-candidate-123"), db: AsyncSession = Depends(get_db)):
    if db is None:
        return APIResponse(data=[])
    bookings = await booking_service.list_candidate_bookings(db, candidate_id)
    return APIResponse(data=[BookingResponse.model_validate(item, from_attributes=True) for item in bookings])
