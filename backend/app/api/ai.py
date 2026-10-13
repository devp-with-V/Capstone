import asyncio

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.common import APIResponse, APIError
from app.services.ai_service import ai_service

router = APIRouter()

class ChatMessage(BaseModel):
    sender: str
    content: str
    sender_name: Optional[str] = None
    is_blueprint: bool = False

class InterviewChatRequest(BaseModel):
    messages: List[ChatMessage]
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None

class InterviewChatResponse(BaseModel):
    reply: str
    sender: str = "ai"
    sender_name: str = "AI Proctor (AURA)"


class InterviewRubricRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=2, max_length=100)
    target_role: str = "Software Engineer"


class InterviewRubricResponse(BaseModel):
    communication_score: int = Field(..., ge=1, le=5)
    technical_score: int = Field(..., ge=1, le=5)
    problem_solving_score: int = Field(..., ge=1, le=5)
    star_score: float = Field(..., ge=1, le=5)
    summary: str
    scoring_method: str

@router.post("/interview/chat", response_model=APIResponse[InterviewChatResponse])
async def interview_chat(payload: InterviewChatRequest):
    try:
        dict_messages = [
            {"role": "assistant" if m.sender == "ai" else "user", "content": m.content, "sender": m.sender}
            for m in payload.messages
        ]
        reply = ai_service.generate_interview_reply(
            messages=dict_messages,
            target_role=payload.target_role or "Software Engineer",
            job_description=payload.job_description
        )
        return APIResponse(data=InterviewChatResponse(reply=reply))
    except Exception as e:
        return APIResponse(error=APIError(message=str(e)))


@router.post("/interview/rubric", response_model=APIResponse[InterviewRubricResponse])
async def interview_rubric(payload: InterviewRubricRequest):
    """Score completed answers; do not include unsent text or scratchpad diagrams."""
    turns = []
    current_question = ""
    for message in payload.messages:
        content = message.content.strip()
        if len(content) > 5000:
            raise HTTPException(status_code=422, detail="Each message must be at most 5000 characters")
        if message.sender == "ai":
            current_question = content
        elif message.sender == "candidate" and content and not message.is_blueprint:
            turns.append({"question": current_question, "answer": content})

    if not turns:
        raise HTTPException(status_code=422, detail="Answer at least one question before ending the interview")

    rubric = await asyncio.to_thread(
        ai_service.score_interview_turns, turns, payload.target_role
    )
    return APIResponse(data=InterviewRubricResponse(**rubric))
