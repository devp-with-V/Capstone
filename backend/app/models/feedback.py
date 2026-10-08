from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Feedback(Base):
    __tablename__ = "feedback"

    session_id: Mapped[str] = mapped_column(String, index=True)
    communication_score: Mapped[int] = mapped_column()
    technical_score: Mapped[int] = mapped_column()
    problem_solving_score: Mapped[int] = mapped_column()
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    authored_by: Mapped[str] = mapped_column(String)