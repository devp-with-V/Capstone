from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VideoSessionCreate(BaseModel):
    user_id: str


class VideoSessionResponse(BaseModel):
    id: str
    room_name: str
    user_id: str
    status: str
    created_at: datetime
    ended_at: Optional[datetime] = None


class VideoSessionJoinResponse(BaseModel):
    session_id: str
    room_name: str
    status: str


class VideoSessionEndResponse(BaseModel):
    session_id: str
    status: str
    ended_at: datetime