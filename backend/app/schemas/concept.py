from pydantic import BaseModel
from typing import Optional, List

class ConceptResponse(BaseModel):
    id: int
    lecture_id: int
    name: str
    description: str
    importance: float
    difficulty: str
    parent_concept_id: Optional[int] = None

    class Config:
        from_attributes = True

class ConceptListResponse(BaseModel):
    concepts: List[ConceptResponse]
    total: int

class ConceptMapNode(BaseModel):
    id: int
    name: str
    importance: float
    difficulty: str
    children: List['ConceptMapNode'] = []
