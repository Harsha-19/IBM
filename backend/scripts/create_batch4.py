import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

validation_service = '''from sqlalchemy.orm import Session
from app.models.question import Question, ValidationResult, QuestionStatus
from app.models.lecture import Lecture
from app.ai.provider import get_ai_provider

def validate_questions(db: Session, lecture_id: int):
    questions = db.query(Question).filter(Question.lecture_id == lecture_id).all()
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    provider = get_ai_provider()
    
    for q in questions:
        q_dict = {"question_text": q.question_text, "options": [opt.option_text for opt in q.options]}
        val_data = provider.validate_question(q_dict, lecture.transcript)
        
        # Calculate overall score based on weights
        overall_score = (
            val_data.get("grounding_score", 0) * 0.30 +
            val_data.get("correctness_score", 0) * 0.25 +
            val_data.get("clarity_score", 0) * 0.15 +
            val_data.get("distractor_score", 0) * 0.15 +
            val_data.get("difficulty_score", 0) * 0.15
        ) * 100
        
        if overall_score < 60:
            status = "rejected"
            q.status = QuestionStatus.REJECTED
        elif overall_score <= 75:
            status = "review"
            q.status = QuestionStatus.REVIEW
        else:
            status = "approved"
            q.status = QuestionStatus.APPROVED
            
        val_result = ValidationResult(
            question_id=q.id,
            grounding_score=val_data.get("grounding_score", 0),
            correctness_score=val_data.get("correctness_score", 0),
            clarity_score=val_data.get("clarity_score", 0),
            difficulty_score=val_data.get("difficulty_score", 0),
            distractor_score=val_data.get("distractor_score", 0),
            overall_score=overall_score,
            validation_status=status
        )
        db.add(val_result)
    db.commit()
'''
write_file(r"d:\IBM\backend\app\services\validation_service.py", validation_service)

quiz_service = '''from sqlalchemy.orm import Session
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, Answer
from app.models.question import Question, QuestionStatus
import random

def create_quiz(db: Session, lecture_id: int, user_id: int, num_questions: int = 10, is_adaptive: bool = False):
    quiz = Quiz(
        lecture_id=lecture_id,
        user_id=user_id,
        title="Generated Quiz",
        status="published",
        num_questions=num_questions,
        difficulty="mixed",
        is_adaptive=is_adaptive
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    
    questions = db.query(Question).filter(Question.lecture_id == lecture_id, Question.status == QuestionStatus.APPROVED).all()
    selected = random.sample(questions, min(num_questions, len(questions)))
    
    for idx, q in enumerate(selected):
        qq = QuizQuestion(quiz_id=quiz.id, question_id=q.id, order_index=idx)
        db.add(qq)
    db.commit()
    return quiz

def start_attempt(db: Session, quiz_id: int, user_id: int):
    attempt = QuizAttempt(quiz_id=quiz_id, user_id=user_id)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt

def submit_answers(db: Session, attempt_id: int, answers_data: list):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    correct_count = 0
    for ans in answers_data:
        q = db.query(Question).filter(Question.id == ans.question_id).first()
        correct_option = next((opt for opt in q.options if opt.is_correct), None)
        is_correct = correct_option and correct_option.id == ans.selected_option_id
        if is_correct:
            correct_count += 1
            
        answer = Answer(
            attempt_id=attempt_id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id,
            is_correct=is_correct,
            time_taken_seconds=ans.time_taken_seconds
        )
        db.add(answer)
        
    attempt.score = correct_count
    attempt.total_questions = len(answers_data)
    attempt.percentage = (correct_count / len(answers_data)) * 100 if len(answers_data) > 0 else 0
    db.commit()
    return attempt
'''
write_file(r"d:\IBM\backend\app\services\quiz_service.py", quiz_service)

analytics_service = '''from sqlalchemy.orm import Session

def get_dashboard_stats(db: Session, user_id: int):
    return {
        "total_lectures": 1,
        "total_quizzes_taken": 1,
        "average_score": 85.0,
        "concepts_mastered": 5,
        "total_concepts": 10,
        "weak_concepts_count": 2,
        "learning_streak": 3,
        "total_questions_answered": 20
    }
'''
write_file(r"d:\IBM\backend\app\services\analytics_service.py", analytics_service)

recommendation_service = '''from sqlalchemy.orm import Session

def generate_recommendations(db: Session, user_id: int):
    return []
'''
write_file(r"d:\IBM\backend\app\services\recommendation_service.py", recommendation_service)

print("Batch 4 created.")
