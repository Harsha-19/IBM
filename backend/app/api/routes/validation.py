from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.user import User
from app.models.question import Question, ValidationResult, QuestionStatus, QuestionOption
from app.auth.service import get_current_user
from app.services.validation_service import validate_questions

router = APIRouter()

@router.post("/{lecture_id}/validate")
def trigger_validation(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    validate_questions(db, lecture_id)
    return {"status": "validated"}

@router.get("/stats")
def get_validation_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_generated = db.query(Question).count()
    total_approved = db.query(Question).filter(Question.status == QuestionStatus.APPROVED.value).count()
    total_rejected = db.query(Question).filter(Question.status == QuestionStatus.REJECTED.value).count()
    total_review = db.query(Question).filter(Question.status == QuestionStatus.REVIEW.value).count()
    
    avg_score = db.query(func.avg(ValidationResult.overall_score)).scalar()
    
    total_validated = db.query(ValidationResult).count()
    grounding_failures = db.query(ValidationResult).filter(ValidationResult.grounding_score < 0.6).count()
    correctness_failures = db.query(ValidationResult).filter(ValidationResult.correctness_score < 0.6).count()
    
    return {
        "total_generated": total_generated,
        "total_approved": total_approved,
        "total_rejected": total_rejected,
        "total_review": total_review,
        "average_score": round(float(avg_score), 1) if avg_score else 0,
        "grounding_failure_rate": round(grounding_failures / total_validated * 100, 1) if total_validated > 0 else 0,
        "correctness_failure_rate": round(correctness_failures / total_validated * 100, 1) if total_validated > 0 else 0,
    }

@router.get("/questions")
def get_questions_for_review(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    questions = db.query(Question).all()
    result = []
    for q in questions:
        val_results = db.query(ValidationResult).filter(ValidationResult.question_id == q.id).all()
        result.append({
            "id": q.id,
            "lecture_id": q.lecture_id,
            "concept_id": q.concept_id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "difficulty": q.difficulty,
            "explanation": q.explanation,
            "status": q.status,
            "options": [{"id": o.id, "option_text": o.option_text, "is_correct": o.is_correct, "order_index": o.order_index} for o in q.options],
            "created_at": q.created_at.isoformat() if q.created_at else None,
            "validation_results": [
                {"id": v.id, "grounding_score": v.grounding_score, "correctness_score": v.correctness_score, "clarity_score": v.clarity_score, "difficulty_score": v.difficulty_score, "distractor_score": v.distractor_score, "overall_score": v.overall_score, "validation_status": v.validation_status, "feedback": v.feedback, "created_at": v.created_at.isoformat() if v.created_at else None}
                for v in val_results
            ]
        })
    return result

@router.post("/questions/{question_id}/approve")
def approve_question(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.status = QuestionStatus.APPROVED.value
    db.commit()
    return {"status": "approved"}

@router.post("/questions/{question_id}/reject")
def reject_question(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.status = QuestionStatus.REJECTED.value
    db.commit()
    return {"status": "rejected"}

@router.post("/questions/{question_id}/regenerate")
def regenerate_question(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.status = QuestionStatus.PENDING.value
    db.commit()
    return {"status": "pending"}
