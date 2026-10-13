from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.auth.service import get_current_user
from app.services.analytics_service import get_dashboard_stats, get_score_trend, get_concept_mastery, get_recent_activity, get_progress_data
from app.services.recommendation_service import get_recommendations

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stats = get_dashboard_stats(db, current_user.id)
    score_trend = get_score_trend(db, current_user.id)
    concept_mastery = get_concept_mastery(db, current_user.id)
    recent_activity = get_recent_activity(db, current_user.id)
    recommendations = get_recommendations(db, current_user.id)
    
    return {
        "stats": stats,
        "score_trend": score_trend,
        "concept_mastery": concept_mastery,
        "recent_activity": recent_activity,
        "recommendations": recommendations,
    }

@router.get("/progress")
def get_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_progress_data(db, current_user.id)

@router.get("/lectures/{lecture_id}")
def get_lecture_analytics(lecture_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.quiz import QuizAttempt, Quiz
    from sqlalchemy import func
    
    attempts = db.query(QuizAttempt).join(Quiz).filter(
        Quiz.lecture_id == lecture_id,
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.completed_at.isnot(None)
    ).all()
    
    return {
        "total_attempts": len(attempts),
        "average_score": round(sum(a.percentage or 0 for a in attempts) / len(attempts), 1) if attempts else 0,
        "best_score": max((a.percentage or 0) for a in attempts) if attempts else 0,
        "attempts": [{"date": a.completed_at.isoformat(), "score": a.percentage} for a in attempts]
    }
