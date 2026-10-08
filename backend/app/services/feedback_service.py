from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate


# Temporary storage for development/testing.
# This will later be replaced by the Supabase/PostgreSQL database.
_feedback_store = {}


class FeedbackService:

    @staticmethod
    async def create_feedback(
        db: AsyncSession | None,
        feedback_in: FeedbackCreate
    ) -> Feedback:

        feedback = Feedback(
            session_id=feedback_in.session_id,
            communication_score=feedback_in.communication_score,
            technical_score=feedback_in.technical_score,
            problem_solving_score=feedback_in.problem_solving_score,
            comments=feedback_in.comments,
            authored_by=feedback_in.authored_by,
        )

        # If database is available, save to database.
        if db:
            try:
                db.add(feedback)
                await db.commit()
                await db.refresh(feedback)
                return feedback
            except Exception:
                await db.rollback()

        # Temporary development storage
        feedback.id = f"feedback-{len(_feedback_store) + 1}"
        _feedback_store[feedback.session_id] = feedback

        return feedback

    @staticmethod
    async def get_feedback(
        db: AsyncSession | None,
        session_id: str
    ) -> Optional[Feedback]:

        # If database is available, try database first.
        if db:
            try:
                result = await db.execute(
                    select(Feedback).where(
                        Feedback.session_id == session_id
                    )
                )

                feedback = result.scalar_one_or_none()

                if feedback:
                    return feedback

            except Exception:
                pass

        # Temporary development storage
        return _feedback_store.get(session_id)


feedback_service = FeedbackService()