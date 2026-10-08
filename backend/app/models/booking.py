from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ExpertProfile(Base):
    __tablename__ = "expert_profiles"

    user_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120))
    headline: Mapped[str] = mapped_column(String(180))
    company: Mapped[str | None] = mapped_column(String(120), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    domains: Mapped[str] = mapped_column(String(500), default="")
    years_experience: Mapped[int] = mapped_column(default=0)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"
    __table_args__ = (Index("ix_slots_expert_start", "expert_id", "start_time"),)

    expert_id: Mapped[str] = mapped_column(ForeignKey("expert_profiles.id", ondelete="CASCADE"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False, index=True)


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (Index("ix_bookings_candidate_start", "candidate_id", "scheduled_start"),)

    candidate_id: Mapped[str] = mapped_column(String, index=True)
    expert_id: Mapped[str] = mapped_column(ForeignKey("expert_profiles.id", ondelete="RESTRICT"), index=True)
    slot_id: Mapped[str] = mapped_column(ForeignKey("availability_slots.id", ondelete="RESTRICT"), unique=True)
    scheduled_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    scheduled_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    agenda: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="scheduled", index=True)
    jitsi_room_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
