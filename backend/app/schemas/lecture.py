from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SectionResponse(BaseModel):
    id: int
    title: str
    content: str
    order_index: int

    class Config:
        from_attributes = True

class LectureCreate(BaseModel):
    title: str
    description: Optional[str] = None
    source_type: str
    content: Optional[str] = None

class LectureResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    source_type: str
    status: str
    word_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class LectureDetailResponse(LectureResponse):
    transcript: str
    sections: List[SectionResponse] = []
    concepts: List[dict] = []
    quiz_count: int = 0

class LectureListResponse(BaseModel):
    lectures: List[LectureResponse]
    total: int
