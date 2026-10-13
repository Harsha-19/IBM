import os

files = {
    r"d:\IBM\backend\app\services\__init__.py": "",
    r"d:\IBM\backend\app\services\analytics_service.py": """from sqlalchemy.orm import Session
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
""",
    r"d:\IBM\backend\app\services\recommendation_service.py": """from sqlalchemy.orm import Session
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
""",
    r"d:\IBM\backend\app\services\lecture_service.py": """from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.lecture import Lecture, LectureStatus
import os

def create_lecture(db: Session, user_id: int, title: str, source_type: str, content: str = None, file: UploadFile = None, description: str = None):
    lecture = Lecture(
        user_id=user_id,
        title=title,
        description=description,
        source_type=source_type,
        status=LectureStatus.PENDING.value
    )
    
    if content:
        lecture.transcript = content
        lecture.word_count = len(content.split())
    elif file:
        lecture.transcript = "Extracted file content placeholder"
        lecture.word_count = len(lecture.transcript.split())
        
    db.add(lecture)
    db.commit()
    db.refresh(lecture)
    return lecture

def get_lecture(db: Session, lecture_id: int):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return lecture

def get_all_lectures(db: Session, user_id: int) -> list:
    return db.query(Lecture).filter(Lecture.user_id == user_id).order_by(Lecture.created_at.desc()).all()

def delete_lecture(db: Session, lecture_id: int, user_id: int):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id, Lecture.user_id == user_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    db.delete(lecture)
    db.commit()

def process_lecture(db: Session, lecture_id: int):
    from app.services.concept_service import extract_concepts
    from app.services.question_service import generate_questions  
    from app.services.validation_service import validate_questions
    
    lecture = get_lecture(db, lecture_id)
    lecture.status = LectureStatus.PROCESSING.value
    db.commit()
    
    try:
        extract_concepts(db, lecture_id)
        generate_questions(db, lecture_id)
        validate_questions(db, lecture_id)
        
        lecture.status = LectureStatus.COMPLETED.value
        db.commit()
    except Exception as e:
        lecture.status = LectureStatus.FAILED.value
        db.commit()
        raise
    
    return lecture
""",
    r"d:\IBM\backend\app\services\concept_service.py": """from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.concept import Concept
from app.models.lecture import Lecture
from app.ai.provider import get_ai_provider

def extract_concepts(db: Session, lecture_id: int):
    existing = db.query(Concept).filter(Concept.lecture_id == lecture_id).all()
    if existing:
        return existing
    
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    provider = get_ai_provider()
    concepts_data = provider.extract_concepts(lecture.transcript)
    
    concepts = []
    for c_data in concepts_data:
        concept = Concept(
            lecture_id=lecture.id,
            name=c_data['name'],
            description=c_data.get('description', ''),
            importance=c_data.get('importance', 0.5),
            difficulty=c_data.get('difficulty', 'medium')
        )
        db.add(concept)
        concepts.append(concept)
    db.commit()
    for c in concepts:
        db.refresh(c)
    return concepts

def get_concepts(db: Session, lecture_id: int):
    return db.query(Concept).filter(Concept.lecture_id == lecture_id).all()

def get_concept_map(db: Session, lecture_id: int):
    concepts = db.query(Concept).filter(Concept.lecture_id == lecture_id).all()
    nodes = []
    for c in concepts:
        nodes.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "importance": c.importance,
            "difficulty": c.difficulty,
            "children": []
        })
    return {"nodes": nodes, "lecture_id": lecture_id}
""",
    r"d:\IBM\backend\app\services\question_service.py": """from sqlalchemy.orm import Session
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
""",
    r"d:\IBM\backend\app\services\validation_service.py": """from sqlalchemy.orm import Session
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
""",
    r"d:\IBM\backend\app\services\quiz_service.py": """from sqlalchemy.orm import Session
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
"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
