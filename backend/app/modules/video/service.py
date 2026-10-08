from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.video.models import VideoSession


class VideoService:

    _sessions: dict[str, VideoSession] = {}

    @staticmethod
    async def create_session(
        db: AsyncSession,
        user_id: str
    ) -> VideoSession:

        session_id = str(uuid4())
        room_name = f"capstone-{session_id}"

        session = VideoSession(
            id=session_id,
            room_name=room_name,
            user_id=user_id,
            status="waiting",
            created_at=datetime.now(timezone.utc)
        )

        VideoService._sessions[session_id] = session

        return session

    @staticmethod
    async def get_session(
        db: AsyncSession,
        session_id: str
    ) -> VideoSession | None:

        return VideoService._sessions.get(session_id)

    @staticmethod
    async def join_session(
        db: AsyncSession,
        session_id: str
    ) -> VideoSession | None:

        session = VideoService._sessions.get(session_id)

        if not session:
            return None

        if session.status == "waiting":
            session.status = "active"

        return session

    @staticmethod
    async def end_session(
        db: AsyncSession,
        session_id: str
    ) -> VideoSession | None:

        session = VideoService._sessions.get(session_id)

        if not session:
            return None

        session.status = "ended"
        session.ended_at = datetime.now(timezone.utc)

        return session


video_service = VideoService()