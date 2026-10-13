from sqlalchemy.orm import Session
from app.models.learning import LearningProgress, Recommendation
from app.models.concept import Concept

def generate_recommendations(db: Session, user_id: int) -> list:
    db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.is_completed == False
    ).delete()
    
    progress_items = db.query(LearningProgress).filter(
        LearningProgress.user_id == user_id,
        LearningProgress.attempt_count > 0
    ).all()
    
    recommendations = []
    for p in progress_items:
        concept = db.query(Concept).filter(Concept.id == p.concept_id).first()
        if not concept:
            continue
        
        if p.mastery_score < 40:
            rec = Recommendation(
                user_id=user_id,
                concept_id=concept.id,
                recommendation_type="review",
                reason=f"Your mastery of '{concept.name}' is {p.mastery_score:.0f}%. Review the fundamentals and try practice questions.",
                priority=3
            )
            db.add(rec)
            recommendations.append(rec)
        elif p.mastery_score < 70:
            rec = Recommendation(
                user_id=user_id,
                concept_id=concept.id,
                recommendation_type="practice",
                reason=f"You're developing understanding of '{concept.name}' ({p.mastery_score:.0f}%). More practice will solidify your knowledge.",
                priority=2
            )
            db.add(rec)
            recommendations.append(rec)
        elif p.mastery_score >= 80 and p.attempt_count >= 3:
            rec = Recommendation(
                user_id=user_id,
                concept_id=concept.id,
                recommendation_type="advance",
                reason=f"Excellent mastery of '{concept.name}' ({p.mastery_score:.0f}%). Consider exploring advanced or related topics.",
                priority=1
            )
            db.add(rec)
            recommendations.append(rec)
    
    db.commit()
    return recommendations

def get_recommendations(db: Session, user_id: int) -> list:
    recs = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.is_completed == False
    ).order_by(Recommendation.priority.desc()).all()
    
    result = []
    for r in recs:
        concept = db.query(Concept).filter(Concept.id == r.concept_id).first()
        result.append({
            "id": r.id,
            "concept_id": r.concept_id,
            "concept_name": concept.name if concept else "Unknown",
            "recommendation_type": r.recommendation_type,
            "reason": r.reason,
            "priority": r.priority,
            "is_completed": r.is_completed,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result

def complete_recommendation(db: Session, rec_id: int, user_id: int):
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == user_id
    ).first()
    if rec:
        rec.is_completed = True
        db.commit()
    return rec
