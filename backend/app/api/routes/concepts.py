from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.auth.service import get_current_user
from app.services.concept_service import extract_concepts, get_concepts, get_concept_map

router = APIRouter()

@router.get("/{lecture_id}/concepts")
def get_lecture_concepts(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    concepts = get_concepts(db, lecture_id)
    return {"concepts": [{"id": c.id, "lecture_id": c.lecture_id, "name": c.name, "description": c.description, "importance": c.importance, "difficulty": c.difficulty, "parent_concept_id": c.parent_concept_id} for c in concepts], "total": len(concepts)}

@router.post("/{lecture_id}/extract")
def trigger_concept_extraction(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    concepts = extract_concepts(db, lecture_id)
    return {"concepts": [{"id": c.id, "name": c.name, "description": c.description, "importance": c.importance, "difficulty": c.difficulty} for c in concepts], "total": len(concepts)}

@router.get("/{lecture_id}/concept-map")
def get_lecture_concept_map(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_concept_map(db, lecture_id)
