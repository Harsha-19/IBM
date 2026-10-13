from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, Answer
from app.models.question import Question, QuestionStatus
from app.models.concept import Concept
from app.models.learning import LearningProgress

def create_quiz(db: Session, lecture_id: int, user_id: int, num_questions: int, is_adaptive: bool):
    questions = db.query(Question).filter(
        Question.lecture_id == lecture_id,
        Question.status == QuestionStatus.APPROVED.value
    ).limit(num_questions).all()
    
    quiz = Quiz(
        lecture_id=lecture_id,
        user_id=user_id,
        title="Auto-generated Quiz",
        status="published",
        num_questions=len(questions),
        is_adaptive=is_adaptive
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    
    for idx, q in enumerate(questions):
        qq = QuizQuestion(quiz_id=quiz.id, question_id=q.id, order_index=idx)
        db.add(qq)
    db.commit()
    return quiz

def get_quiz(db: Session, quiz_id: int):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

def get_user_quizzes(db: Session, user_id: int, lecture_id: int = None):
    query = db.query(Quiz).filter(Quiz.user_id == user_id)
    if lecture_id:
        query = query.filter(Quiz.lecture_id == lecture_id)
    return query.order_by(Quiz.created_at.desc()).all()

def start_attempt(db: Session, quiz_id: int, user_id: int):
    attempt = QuizAttempt(quiz_id=quiz_id, user_id=user_id)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt

def submit_answers(db: Session, attempt_id: int, user_id: int, answers_data: list):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    
    correct_count = 0
    for ans in answers_data:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        is_correct = False
        if ans.selected_option_id:
            for opt in question.options:
                if opt.id == ans.selected_option_id and opt.is_correct:
                    is_correct = True
                    break
        
        answer = Answer(
            attempt_id=attempt_id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id,
            is_correct=is_correct,
            time_taken_seconds=ans.time_taken_seconds
        )
        db.add(answer)
        if is_correct:
            correct_count += 1
            
    attempt.completed_at = datetime.utcnow()
    attempt.score = correct_count
    attempt.total_questions = len(answers_data)
    attempt.percentage = (correct_count / len(answers_data) * 100) if answers_data else 0
    db.commit()
    
    _update_learning_progress(db, user_id, attempt_id)
    return get_attempt_result(db, attempt_id)

def _update_learning_progress(db: Session, user_id: int, attempt_id: int):
    answers = db.query(Answer).filter(Answer.attempt_id == attempt_id).all()
    for ans in answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        if not question or not question.concept_id:
            continue
        
        progress = db.query(LearningProgress).filter(
            LearningProgress.user_id == user_id,
            LearningProgress.concept_id == question.concept_id
        ).first()
        
        if not progress:
            progress = LearningProgress(
                user_id=user_id,
                concept_id=question.concept_id,
                mastery_score=0,
                attempt_count=0,
                correct_count=0,
                incorrect_count=0,
            )
            db.add(progress)
        
        progress.attempt_count += 1
        if ans.is_correct:
            progress.correct_count += 1
        else:
            progress.incorrect_count += 1
        
        total = progress.correct_count + progress.incorrect_count
        if total > 0:
            progress.mastery_score = round((progress.correct_count / total) * 100, 1)
        progress.last_attempt_at = datetime.utcnow()
    
    db.commit()

def get_attempt_result(db: Session, attempt_id: int):
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    answers = db.query(Answer).filter(Answer.attempt_id == attempt_id).all()
    
    answer_results = []
    concept_stats = {}
    
    for ans in answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        correct_option = next((o for o in question.options if o.is_correct), None) if question else None
        
        answer_results.append({
            "question_id": ans.question_id,
            "question_text": question.question_text if question else "",
            "selected_option_id": ans.selected_option_id,
            "correct_option_id": correct_option.id if correct_option else None,
            "is_correct": ans.is_correct or False,
            "explanation": question.explanation or "" if question else "",
            "time_taken_seconds": ans.time_taken_seconds or 0,
        })
        
        if question and question.concept_id:
            concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
            if concept:
                if concept.id not in concept_stats:
                    concept_stats[concept.id] = {"concept_id": concept.id, "concept_name": concept.name, "total": 0, "correct": 0}
                concept_stats[concept.id]["total"] += 1
                if ans.is_correct:
                    concept_stats[concept.id]["correct"] += 1
    
    concept_performance = []
    for cs in concept_stats.values():
        cs["percentage"] = round((cs["correct"] / cs["total"]) * 100, 1) if cs["total"] > 0 else 0
        concept_performance.append(cs)
    
    return {
        "attempt_id": attempt.id,
        "quiz_id": attempt.quiz_id,
        "score": attempt.score or 0,
        "total_questions": attempt.total_questions or 0,
        "percentage": attempt.percentage or 0,
        "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else datetime.utcnow().isoformat(),
        "answers": answer_results,
        "concept_performance": concept_performance,
    }
