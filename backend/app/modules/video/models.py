from datetime import datetime

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class VideoSession(Base):
    __tablename__ = "video_sessions"

    room_name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="waiting",
        nullable=False
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )