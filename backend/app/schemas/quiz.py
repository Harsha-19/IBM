from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QuizCreateRequest(BaseModel):
    lecture_id: int
    num_questions: int = 10
    difficulty: str = 'mixed'
    is_adaptive: bool = False
    question_types: Optional[List[str]] = None
    concept_ids: Optional[List[int]] = None
    time_limit_minutes: Optional[int] = None

class QuizResponse(BaseModel):
    id: int
    lecture_id: int
    user_id: int
    title: str
    status: str
    num_questions: int
    difficulty: str
    is_adaptive: bool
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionNoCorrectOption(BaseModel):
    id: int
    lecture_id: int
    concept_id: Optional[int] = None
    question_text: str
    question_type: str
    difficulty: str
    explanation: Optional[str] = None
    status: str
    options: List[dict] # We mask is_correct later in code
    created_at: datetime

    class Config:
        from_attributes = True

class QuizQuestionResponse(BaseModel):
    id: int
    order_index: int
    question: QuestionNoCorrectOption

    class Config:
        from_attributes = True

class QuizDetailResponse(QuizResponse):
    questions: List[QuizQuestionResponse]

class AttemptStartResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    started_at: datetime
    questions: List[QuizQuestionResponse]

class AnswerSubmission(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    time_taken_seconds: int = 0

class QuizSubmission(BaseModel):
    answers: List[AnswerSubmission]

class ConceptPerformanceResponse(BaseModel):
    concept_id: int
    concept_name: str
    total: int
    correct: int
    percentage: float

class AnswerResultResponse(BaseModel):
    question_id: int
    question_text: str
    selected_option_id: Optional[int] = None
    correct_option_id: Optional[int] = None
    is_correct: bool
    explanation: Optional[str] = None
    time_taken_seconds: int

class AttemptResultResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    score: int
    total_questions: int
    percentage: float
    completed_at: datetime
    answers: List[AnswerResultResponse]
    concept_performance: List[ConceptPerformanceResponse]
