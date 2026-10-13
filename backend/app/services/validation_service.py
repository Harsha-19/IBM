from sqlalchemy.orm import Session
from app.models.question import Question, ValidationResult, QuestionStatus
from app.ai.provider import get_ai_provider

def validate_questions(db: Session, lecture_id: int):
    questions = db.query(Question).filter(Question.lecture_id == lecture_id).all()
    provider = get_ai_provider()
    
    for q in questions:
        res = provider.validate_question(q.question_text)
        
        v = ValidationResult(
            question_id=q.id,
            grounding_score=res['grounding_score'],
            correctness_score=res['correctness_score'],
            clarity_score=res['clarity_score'],
            difficulty_score=res['difficulty_score'],
            distractor_score=res['distractor_score'],
            overall_score=res['overall_score'],
            validation_status='completed',
            feedback=res.get('feedback', '')
        )
        db.add(v)
        
        # update question status
        if res['overall_score'] >= 75:
            q.status = QuestionStatus.APPROVED.value
        elif res['overall_score'] >= 60:
            q.status = QuestionStatus.REVIEW.value
        else:
            q.status = QuestionStatus.REJECTED.value
            
    db.commit()
