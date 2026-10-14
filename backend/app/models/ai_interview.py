from sqlalchemy import String, Text, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class AIInterviewSession(Base):
    __tablename__ = "ai_interview_sessions"

    user_id: Mapped[str] = mapped_column(String, index=True)
    target_role: Mapped[str] = mapped_column(String, default="Software Engineer")
    level: Mapped[str] = mapped_column(String, default="Senior")
    domain: Mapped[str] = mapped_column(String, default="System Design")
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_min: Mapped[int] = mapped_column(Integer, default=30)
    question_count: Mapped[int] = mapped_column(Integer, default=8)
    mode: Mapped[str] = mapped_column(String, default="voice")
    status: Mapped[str] = mapped_column(String, default="active", index=True)
    questions: Mapped[list] = mapped_column(JSON, default=list)
    video_url: Mapped[str | None] = mapped_column(String, nullable=True)


class AIInterviewTurn(Base):
    __tablename__ = "ai_interview_turns"

    session_id: Mapped[str] = mapped_column(
        String, ForeignKey("ai_interview_sessions.id", ondelete="CASCADE"), index=True
    )
    question_idx: Mapped[int] = mapped_column(Integer, default=0)
    question_text: Mapped[str] = mapped_column(Text, default="")
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    analysis: Mapped[dict] = mapped_column(JSON, default=dict)
