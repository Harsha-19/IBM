from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion
from app.auth.service import get_current_user
from app.services.quiz_service import create_quiz, start_attempt, submit_answers, get_quiz, get_user_quizzes, get_attempt_result
from app.schemas.quiz import QuizCreateRequest, QuizResponse, AttemptStartResponse, QuizSubmission

router = APIRouter()

@router.post("", response_model=QuizResponse)
@router.post("/", response_model=QuizResponse, include_in_schema=False)
def create_new_quiz(request: QuizCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_quiz(db, request.lecture_id, current_user.id, request.num_questions, request.is_adaptive)

@router.get("")
@router.get("/", include_in_schema=False)
def list_quizzes(lecture_id: int = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quizzes = get_user_quizzes(db, current_user.id, lecture_id)
    return [{"id": q.id, "lecture_id": q.lecture_id, "user_id": q.user_id, "title": q.title, "status": q.status, "num_questions": q.num_questions, "difficulty": q.difficulty, "is_adaptive": q.is_adaptive, "created_at": q.created_at.isoformat() if q.created_at else None} for q in quizzes]

@router.get("/{quiz_id}")
def read_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = get_quiz(db, quiz_id)
    return {"id": quiz.id, "lecture_id": quiz.lecture_id, "user_id": quiz.user_id, "title": quiz.title, "status": quiz.status, "num_questions": quiz.num_questions, "difficulty": quiz.difficulty, "is_adaptive": quiz.is_adaptive, "created_at": quiz.created_at.isoformat() if quiz.created_at else None}

@router.post("/{quiz_id}/attempts")
def start_quiz_attempt(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempt = start_attempt(db, quiz_id, current_user.id)
    
    quiz = get_quiz(db, quiz_id)
    quiz_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).order_by(QuizQuestion.order_index).all()
    
    questions = []
    for qq in quiz_questions:
        q = qq.question
        questions.append({
            "id": qq.id,
            "order_index": qq.order_index,
            "question": {
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "difficulty": q.difficulty,
                "options": [{"id": o.id, "option_text": o.option_text, "order_index": o.order_index} for o in q.options]
            }
        })
    
    return {"attempt_id": attempt.id, "quiz_id": quiz_id, "started_at": attempt.started_at.isoformat(), "questions": questions}

@router.post("/attempts/{attempt_id}/submit")
def submit_quiz_answers(attempt_id: int, submission: QuizSubmission, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = submit_answers(db, attempt_id, current_user.id, submission.answers)
    return result

@router.get("/attempts/{attempt_id}/result")
def read_attempt_result(attempt_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_attempt_result(db, attempt_id)
