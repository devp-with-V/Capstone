from pydantic import BaseModel, Field
from typing import Optional, List


class FeedbackCreate(BaseModel):
    session_id: str
    communication_score: int = Field(..., ge=1, le=5)
    technical_score: int = Field(..., ge=1, le=5)
    problem_solving_score: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
    authored_by: str = "ai"


class FeedbackResponse(BaseModel):
    id: str
    session_id: str
    communication_score: int
    technical_score: int
    problem_solving_score: int
    comments: Optional[str] = None
    authored_by: str


class FeedbackReport(BaseModel):
    id: str
    session_id: str
    communication_score: int
    technical_score: int
    problem_solving_score: int
    comments: Optional[str] = None
    authored_by: str
    overall_score: float
    strengths: List[str] = []
    areas_for_improvement: List[str] = []
    recommendation: Optional[str] = None