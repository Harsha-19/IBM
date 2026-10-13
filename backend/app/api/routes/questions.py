from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.question import Question, QuestionStatus
from app.auth.service import get_current_user
from app.services.question_service import generate_questions, get_questions

router = APIRouter()

@router.get("/{lecture_id}/questions")
def get_lecture_questions(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    questions = get_questions(db, lecture_id)
    result = []
    for q in questions:
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
        })
    return {"questions": result, "total": len(result)}

@router.post("/{lecture_id}/generate")
def trigger_question_generation(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    questions = generate_questions(db, lecture_id)
    return {"questions": [{"id": q.id, "question_text": q.question_text, "status": q.status} for q in questions], "total": len(questions)}

@router.post("/{question_id}/action")
def perform_question_action(question_id: int, action: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if action == "approve":
        question.status = QuestionStatus.APPROVED.value
    elif action == "reject":
        question.status = QuestionStatus.REJECTED.value
    elif action == "review":
        question.status = QuestionStatus.REVIEW.value
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    db.commit()
    return {"status": question.status}

@router.get("/{question_id}/validation")
def get_question_validation(question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.question import ValidationResult
    validation = db.query(ValidationResult).filter(ValidationResult.question_id == question_id).order_by(ValidationResult.created_at.desc()).first()
    if not validation:
        raise HTTPException(status_code=404, detail="Validation result not found")
    return {
        "id": validation.id,
        "question_id": validation.question_id,
        "grounding_score": validation.grounding_score,
        "correctness_score": validation.correctness_score,
        "clarity_score": validation.clarity_score,
        "difficulty_score": validation.difficulty_score,
        "distractor_score": validation.distractor_score,
        "overall_score": validation.overall_score,
        "validation_status": validation.validation_status,
        "feedback": validation.feedback,
        "created_at": validation.created_at.isoformat() if validation.created_at else None,
    }
