from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStatsResponse(BaseModel):
    total_lectures: int
    total_quizzes_taken: int
    average_score: float
    concepts_mastered: int
    total_concepts: int
    weak_concepts_count: int
    learning_streak: int
    total_questions_answered: int

class ScoreTrendPoint(BaseModel):
    date: str
    score: float

class ConceptMasteryItem(BaseModel):
    concept_id: int
    concept_name: str
    mastery_score: float
    attempt_count: int

class RecentActivityItem(BaseModel):
    type: str
    title: str
    description: str
    date: datetime
    score: Optional[float] = None

class RecommendationItem(BaseModel):
    id: int
    concept_id: int
    concept_name: str
    recommendation_type: str
    reason: str
    priority: int

class DashboardResponse(BaseModel):
    stats: DashboardStatsResponse
    score_trend: List[ScoreTrendPoint]
    concept_mastery: List[ConceptMasteryItem]
    recent_activity: List[RecentActivityItem]
    recommendations: List[RecommendationItem]

class ProgressResponse(BaseModel):
    learning_progress: List[ConceptMasteryItem]
    weak_concepts: List[ConceptMasteryItem]
    mastery_distribution: dict
