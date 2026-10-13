from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.lecture import Lecture
from app.auth.service import get_current_user
from app.services.lecture_service import create_lecture, get_lecture, get_all_lectures, delete_lecture, process_lecture
from app.schemas.lecture import LectureResponse, LectureDetailResponse, LectureListResponse, SectionResponse
from app.schemas.concept import ConceptResponse
from typing import Optional, List

router = APIRouter()

@router.get("", response_model=LectureListResponse)
@router.get("/", response_model=LectureListResponse, include_in_schema=False)
def list_lectures(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lectures = get_all_lectures(db, current_user.id)
    return {"lectures": lectures, "total": len(lectures)}

@router.post("", response_model=LectureResponse)
@router.post("/", response_model=LectureResponse, include_in_schema=False)
async def create_new_lecture(
    title: str = Form(...),
    source_type: str = Form(...),
    description: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_lecture(db, current_user.id, title, source_type, content, file, description)

@router.get("/{lecture_id}", response_model=LectureDetailResponse)
def read_lecture(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lecture = get_lecture(db, lecture_id)
    if lecture.user_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    sections = [SectionResponse.model_validate(s) for s in lecture.sections]
    concepts = [ConceptResponse.model_validate(c) for c in lecture.concepts]
    quiz_count = len(lecture.quizzes)
    
    return {
        **LectureResponse.model_validate(lecture).model_dump(),
        "transcript": lecture.transcript,
        "sections": sections,
        "concepts": concepts,
        "quiz_count": quiz_count,
    }

@router.delete("/{lecture_id}")
def remove_lecture(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    delete_lecture(db, lecture_id, current_user.id)
    return {"status": "deleted"}

@router.post("/{lecture_id}/process", response_model=LectureResponse)
def trigger_processing(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lecture = get_lecture(db, lecture_id)
    if lecture.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return process_lecture(db, lecture_id)

@router.get("/{lecture_id}/status")
def get_lecture_status(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lecture = get_lecture(db, lecture_id)
    return {"status": lecture.status}
