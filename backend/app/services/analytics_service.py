from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.user import User
from app.models.lecture import Lecture
from app.models.quiz import Quiz, QuizAttempt, Answer
from app.models.concept import Concept
from app.models.question import Question
from app.models.learning import LearningProgress, Recommendation

def get_dashboard_stats(db: Session, user_id: int) -> dict:
    total_lectures = db.query(Lecture).filter(Lecture.user_id == user_id).count()
    total_quizzes_taken = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id, QuizAttempt.completed_at.isnot(None)).count()
    avg_score_result = db.query(func.avg(QuizAttempt.percentage)).filter(
        QuizAttempt.user_id == user_id, 
        QuizAttempt.completed_at.isnot(None)
    ).scalar()
    average_score = round(float(avg_score_result), 1) if avg_score_result else 0.0
    concepts_mastered = db.query(LearningProgress).filter(
        LearningProgress.user_id == user_id,
        LearningProgress.mastery_score >= 70
    ).count()
    user_lecture_ids = db.query(Lecture.id).filter(Lecture.user_id == user_id).subquery()
    total_concepts = db.query(Concept).filter(Concept.lecture_id.in_(user_lecture_ids)).count()
    weak_concepts_count = db.query(LearningProgress).filter(
        LearningProgress.user_id == user_id,
        LearningProgress.mastery_score < 50,
        LearningProgress.attempt_count > 0
    ).count()
    learning_streak = _calculate_streak(db, user_id)
    total_questions_answered = db.query(Answer).join(QuizAttempt).filter(
        QuizAttempt.user_id == user_id
    ).count()
    return {
        "total_lectures": total_lectures,
        "total_quizzes_taken": total_quizzes_taken,
        "average_score": average_score,
        "concepts_mastered": concepts_mastered,
        "total_concepts": total_concepts,
        "weak_concepts_count": weak_concepts_count,
        "learning_streak": learning_streak,
        "total_questions_answered": total_questions_answered,
    }

def _calculate_streak(db: Session, user_id: int) -> int:
    attempts = db.query(QuizAttempt.started_at).filter(
        QuizAttempt.user_id == user_id
    ).order_by(QuizAttempt.started_at.desc()).all()
    if not attempts:
        return 0
    dates = sorted(set(a.started_at.date() for a in attempts if a.started_at), reverse=True)
    if not dates:
        return 0
    streak = 1
    for i in range(1, len(dates)):
        if (dates[i-1] - dates[i]).days == 1:
            streak += 1
        else:
            break
    return streak

def get_score_trend(db: Session, user_id: int) -> list:
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id,
        QuizAttempt.completed_at.isnot(None)
    ).order_by(QuizAttempt.completed_at).limit(20).all()
    return [
        {"date": a.completed_at.isoformat(), "score": a.percentage or 0}
        for a in attempts
    ]

def get_concept_mastery(db: Session, user_id: int) -> list:
    progress = db.query(LearningProgress).filter(LearningProgress.user_id == user_id).all()
    result = []
    for p in progress:
        concept = db.query(Concept).filter(Concept.id == p.concept_id).first()
        if concept:
            result.append({
                "concept_id": concept.id,
                "concept_name": concept.name,
                "mastery_score": p.mastery_score,
                "attempt_count": p.attempt_count,
            })
    return result

def get_recent_activity(db: Session, user_id: int) -> list:
    activities = []
    recent_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).order_by(QuizAttempt.started_at.desc()).limit(5).all()
    for attempt in recent_attempts:
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
        activities.append({
            "type": "quiz_attempt",
            "title": f"Quiz: {quiz.title}" if quiz else "Quiz Attempt",
            "description": f"Score: {attempt.percentage:.0f}%" if attempt.percentage else "In progress",
            "date": attempt.started_at.isoformat(),
            "score": attempt.percentage,
        })
    recent_lectures = db.query(Lecture).filter(Lecture.user_id == user_id).order_by(Lecture.created_at.desc()).limit(3).all()
    for lecture in recent_lectures:
        activities.append({
            "type": "lecture_upload",
            "title": f"Uploaded: {lecture.title}",
            "description": f"Status: {lecture.status}",
            "date": lecture.created_at.isoformat(),
        })
    activities.sort(key=lambda x: x["date"], reverse=True)
    return activities[:10]

def get_weak_concepts(db: Session, user_id: int) -> list:
    progress_items = db.query(LearningProgress).filter(
        LearningProgress.user_id == user_id,
        LearningProgress.mastery_score < 60,
        LearningProgress.attempt_count > 0
    ).order_by(LearningProgress.mastery_score.asc()).all()
    result = []
    for p in progress_items:
        concept = db.query(Concept).filter(Concept.id == p.concept_id).first()
        if concept:
            result.append({
                "concept_id": concept.id,
                "concept_name": concept.name,
                "mastery_score": p.mastery_score,
                "attempt_count": p.attempt_count,
                "correct_count": p.correct_count,
                "incorrect_count": p.incorrect_count,
                "recommendation": f"Review {concept.name} — focus on understanding {concept.description[:100] if concept.description else 'core concepts'}."
            })
    return result

def get_progress_data(db: Session, user_id: int) -> dict:
    learning_progress = get_concept_mastery(db, user_id)
    weak = get_weak_concepts(db, user_id)
    all_progress = db.query(LearningProgress).filter(LearningProgress.user_id == user_id).all()
    distribution = {"mastered": 0, "proficient": 0, "developing": 0, "weak": 0}
    for p in all_progress:
        if p.mastery_score >= 80:
            distribution["mastered"] += 1
        elif p.mastery_score >= 60:
            distribution["proficient"] += 1
        elif p.mastery_score >= 40:
            distribution["developing"] += 1
        else:
            distribution["weak"] += 1
    return {
        "learning_progress": learning_progress,
        "weak_concepts": weak,
        "mastery_distribution": distribution,
    }
