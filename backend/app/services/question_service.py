from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.question import Question, QuestionOption, QuestionStatus
from app.models.lecture import Lecture
from app.models.concept import Concept
from app.ai.provider import get_ai_provider

def generate_questions(db: Session, lecture_id: int):
    existing = db.query(Question).filter(Question.lecture_id == lecture_id).all()
    if existing:
        return existing
    
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    concepts = db.query(Concept).filter(Concept.lecture_id == lecture_id).all()
    
    provider = get_ai_provider()
    questions_data = provider.generate_questions(lecture.transcript)
    
    questions = []
    for idx, q_data in enumerate(questions_data):
        concept_id = None
        if concepts:
            concept_id = concepts[idx % len(concepts)].id
        
        q = Question(
            lecture_id=lecture.id,
            concept_id=concept_id,
            question_text=q_data['question_text'],
            question_type=q_data.get('question_type', 'multiple_choice'),
            difficulty=q_data.get('difficulty', 'medium'),
            explanation=q_data.get('explanation', ''),
            status=QuestionStatus.PENDING.value
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        
        for opt_idx, opt_data in enumerate(q_data.get('options', [])):
            opt = QuestionOption(
                question_id=q.id,
                option_text=opt_data['text'],
                is_correct=opt_data['is_correct'],
                order_index=opt_idx
            )
            db.add(opt)
        db.commit()
        questions.append(q)
    return questions

def get_questions(db: Session, lecture_id: int):
    return db.query(Question).filter(Question.lecture_id == lecture_id).all()
