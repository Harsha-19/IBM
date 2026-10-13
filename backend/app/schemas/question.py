from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QuestionOptionResponse(BaseModel):
    id: int
    option_text: str
    is_correct: bool
    order_index: int

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: int
    lecture_id: int
    concept_id: Optional[int] = None
    question_text: str
    question_type: str
    difficulty: str
    explanation: Optional[str] = None
    status: str
    options: List[QuestionOptionResponse]
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionListResponse(BaseModel):
    questions: List[QuestionResponse]
    total: int

class ValidationResultResponse(BaseModel):
    id: int
    question_id: int
    grounding_score: float
    correctness_score: float
    clarity_score: float
    difficulty_score: float
    distractor_score: float
    overall_score: float
    validation_status: str
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
