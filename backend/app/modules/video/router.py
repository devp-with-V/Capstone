from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.video.schemas import (
    VideoSessionCreate,
    VideoSessionResponse,
    VideoSessionJoinResponse,
    VideoSessionEndResponse,
)
from app.modules.video.service import video_service


router = APIRouter(
    prefix="/video",
    tags=["Video"]
)


@router.post(
    "/session",
    response_model=VideoSessionResponse
)
async def create_video_session(
    data: VideoSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    return await video_service.create_session(
        db,
        data.user_id
    )


@router.get(
    "/session/{session_id}",
    response_model=VideoSessionResponse
)
async def get_video_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    session = await video_service.get_session(
        db,
        session_id
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Video session not found"
        )

    return session


@router.post(
    "/session/{session_id}/join",
    response_model=VideoSessionJoinResponse
)
async def join_video_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    session = await video_service.join_session(
        db,
        session_id
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Video session not found"
        )

    return VideoSessionJoinResponse(
        session_id=session.id,
        room_name=session.room_name,
        status=session.status
    )


@router.post(
    "/session/{session_id}/end",
    response_model=VideoSessionEndResponse
)
async def end_video_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    session = await video_service.end_session(
        db,
        session_id
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Video session not found"
        )

    return VideoSessionEndResponse(
        session_id=session.id,
        status=session.status,
        ended_at=session.ended_at
    )