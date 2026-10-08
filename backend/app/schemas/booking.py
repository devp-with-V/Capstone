from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class ExpertSummary(BaseModel):
    id: str
    display_name: str
    headline: str
    company: str | None = None
    bio: str | None = None
    domains: list[str]
    years_experience: int


class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime

    @field_validator("end_time")
    @classmethod
    def end_must_be_after_start(cls, value: datetime, info):
        if info.data.get("start_time") and value <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return value


class SlotResponse(BaseModel):
    id: str
    expert_id: str
    start_time: datetime
    end_time: datetime
    is_booked: bool


class BookingCreate(BaseModel):
    slot_id: str
    agenda: str | None = Field(default=None, max_length=500)


class BookingResponse(BaseModel):
    id: str
    candidate_id: str
    expert_id: str
    slot_id: str
    scheduled_start: datetime
    scheduled_end: datetime
    agenda: str | None = None
    status: str
    jitsi_room_name: str | None = None
