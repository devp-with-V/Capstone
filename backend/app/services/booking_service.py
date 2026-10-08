from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import AvailabilitySlot, Booking, ExpertProfile


class BookingService:
    async def list_experts(self, db: AsyncSession, domain: str | None = None) -> list[ExpertProfile]:
        statement = select(ExpertProfile).where(ExpertProfile.is_approved.is_(True))
        if domain:
            statement = statement.where(ExpertProfile.domains.ilike(f"%{domain}%"))
        return list((await db.scalars(statement.order_by(ExpertProfile.display_name))).all())

    async def list_slots(self, db: AsyncSession, expert_id: str) -> list[AvailabilitySlot]:
        now = datetime.now(timezone.utc)
        statement = select(AvailabilitySlot).where(
            AvailabilitySlot.expert_id == expert_id,
            AvailabilitySlot.start_time >= now,
            AvailabilitySlot.is_booked.is_(False),
        ).order_by(AvailabilitySlot.start_time)
        return list((await db.scalars(statement)).all())

    async def create_slot(self, db: AsyncSession, expert_id: str, start_time: datetime, end_time: datetime) -> AvailabilitySlot:
        slot = AvailabilitySlot(expert_id=expert_id, start_time=start_time, end_time=end_time)
        db.add(slot)
        await db.commit()
        await db.refresh(slot)
        return slot

    async def book_slot(self, db: AsyncSession, candidate_id: str, slot_id: str, agenda: str | None) -> Booking:
        # The row lock makes a double-click or two simultaneous requests deterministic: one succeeds.
        slot = await db.scalar(select(AvailabilitySlot).where(AvailabilitySlot.id == slot_id).with_for_update())
        if not slot or slot.is_booked or slot.start_time <= datetime.now(timezone.utc):
            raise ValueError("This time slot is no longer available.")

        slot.is_booked = True
        booking = Booking(
            candidate_id=candidate_id,
            expert_id=slot.expert_id,
            slot_id=slot.id,
            scheduled_start=slot.start_time,
            scheduled_end=slot.end_time,
            agenda=agenda,
            jitsi_room_name=f"preppilot-{uuid4().hex[:12]}",
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        return booking

    async def list_candidate_bookings(self, db: AsyncSession, candidate_id: str) -> list[Booking]:
        statement = select(Booking).where(Booking.candidate_id == candidate_id).order_by(Booking.scheduled_start.desc())
        return list((await db.scalars(statement)).all())


booking_service = BookingService()
