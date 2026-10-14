from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import asyncio

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.ai_interview import AIInterviewSession, AIInterviewTurn
from app.schemas.common import APIResponse, APIError
from app.schemas.user import UserResponse
from app.services.ai_interview_service import ai_interview_service

router = APIRouter()


class CreateSessionRequest(BaseModel):
    target_role: str = "Software Engineer"
    level: str = "Senior"
    domain: str = "System Design"
    duration_min: int = 30
    question_count: int = 8
    job_description: Optional[str] = None
    mode: str = "voice"


class SessionPayload(BaseModel):
    id: str
    status: str
    target_role: str
    level: str
    domain: str
    duration_min: int
    question_count: int
    mode: str
    questions: list[str]
    video_url: Optional[str] = None


def to_payload(s: AIInterviewSession) -> SessionPayload:
    return SessionPayload(
        id=s.id,
        status=s.status,
        target_role=s.target_role,
        level=s.level,
        domain=s.domain,
        duration_min=s.duration_min,
        question_count=s.question_count,
        mode=s.mode,
        questions=list(s.questions or []),
        video_url=s.video_url,
    )


async def get_owned_session(
    session_id: str, current_user: UserResponse, db: AsyncSession
) -> AIInterviewSession | None:
    result = await db.execute(
        select(AIInterviewSession).where(AIInterviewSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        return None
    if session.user_id != current_user.id and current_user.role != "admin":
        return None
    return session


@router.post("/sessions", response_model=APIResponse[SessionPayload])
async def create_session(
    payload: CreateSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        count = max(3, min(12, payload.question_count))
        questions = ai_interview_service.generate_questions(
            target_role=payload.target_role,
            level=payload.level,
            domain=payload.domain,
            count=count,
            job_description=payload.job_description,
        )
        session = AIInterviewSession(
            user_id=current_user.id,
            target_role=payload.target_role,
            level=payload.level,
            domain=payload.domain,
            job_description=payload.job_description,
            duration_min=payload.duration_min,
            question_count=count,
            mode=payload.mode,
            status="active",
            questions=questions,
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return APIResponse(data=to_payload(session))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))


@router.get("/sessions/{session_id}", response_model=APIResponse[SessionPayload])
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    session = await get_owned_session(session_id, current_user, db)
    if not session:
        return APIResponse(error=APIError(message="Interview session not found."))
    return APIResponse(data=to_payload(session))


class TurnPayload(BaseModel):
    turn_id: str
    question_idx: int
    transcript: str
    analysis: dict


@router.post("/sessions/{session_id}/turns", response_model=APIResponse[TurnPayload])
async def submit_turn(
    session_id: str,
    question_idx: int = Form(0),
    transcript: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    try:
        session = await get_owned_session(session_id, current_user, db)
        if not session:
            return APIResponse(error=APIError(message="Interview session not found."))
        if session.status != "active":
            return APIResponse(error=APIError(message="Interview session is already finished."))

        text = (transcript or "").strip()
        if not text and audio is not None:
            audio_bytes = await audio.read()
            if audio_bytes:
                # Local Whisper is CPU-bound — keep it off the event loop.
                text = await asyncio.to_thread(
                    ai_interview_service.transcribe_audio,
                    audio_bytes,
                    audio.filename or "answer.webm",
                )
        if not text:
            return APIResponse(
                error=APIError(message="No answer received. Record audio or type your answer.")
            )

        questions = list(session.questions or [])
        question_text = questions[question_idx] if 0 <= question_idx < len(questions) else ""
        analysis = ai_interview_service.analyze_answer(
            question_text, text, session.target_role
        )
        turn = AIInterviewTurn(
            session_id=session.id,
            question_idx=question_idx,
            question_text=question_text,
            transcript=text,
            analysis=analysis,
        )
        db.add(turn)
        await db.commit()
        await db.refresh(turn)
        return APIResponse(
            data=TurnPayload(
                turn_id=turn.id,
                question_idx=question_idx,
                transcript=text,
                analysis=analysis,
            )
        )
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))


class FinishPayload(BaseModel):
    session_id: str


@router.post("/sessions/{session_id}/finish", response_model=APIResponse[FinishPayload])
async def finish_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """Aggregate the session into a final rubric report.

    The camera recording stays on the candidate's device (downloadable in the
    UI) — nothing is uploaded, so this endpoint needs no video payload.
    """
    try:
        session = await get_owned_session(session_id, current_user, db)
        if not session:
            return APIResponse(error=APIError(message="Interview session not found."))

        await ai_interview_service.finish_session(db, session)
        return APIResponse(data=FinishPayload(session_id=session.id))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))
