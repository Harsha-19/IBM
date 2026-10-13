import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.session import SessionLocal, engine, Base
from app.models.user import User
from app.auth.service import get_password_hash
from app.services.lecture_service import create_lecture, process_lecture
from app.services.quiz_service import create_quiz, start_attempt, submit_answers
from app.services.recommendation_service import generate_recommendations

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. Create Users
        demo_user = User(name="Demo Student", email="demo@example.com", password_hash=get_password_hash("password123"), role="student")
        admin_user = User(name="Admin User", email="admin@example.com", password_hash=get_password_hash("admin123"), role="admin")
        db.add(demo_user)
        db.add(admin_user)
        db.commit()
        db.refresh(demo_user)
        
        # 2. Add Lecture
        ml_text = "Machine learning (ML) is a field of inquiry devoted to understanding and building methods that 'learn', that is, methods that leverage data to improve performance on some set of tasks. It is seen as a part of artificial intelligence. Machine learning algorithms build a model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed to do so. Supervised learning involves learning a function that maps an input to an output based on example input-output pairs. Unsupervised learning finds hidden structure or intrinsic structures in unlabeled data. K-means clustering is an example of an unsupervised algorithm. Reinforcement learning is an area of machine learning concerned with how intelligent agents ought to take actions in an environment in order to maximize the notion of cumulative reward."
        lecture = create_lecture(
            db=db,
            user_id=demo_user.id,
            title="Introduction to Machine Learning",
            source_type="text",
            content=ml_text,
            description="A comprehensive introduction to ML concepts."
        )
        
        # 3. Process Lecture (Extract Concepts, Generate Questions, Validate)
        print("Processing lecture...")
        process_lecture(db, lecture.id)
        
        # 4. Create Quiz
        quiz = create_quiz(db, lecture_id=lecture.id, user_id=demo_user.id, num_questions=3, is_adaptive=False)
        
        # 5. Start Attempt
        attempt = start_attempt(db, quiz_id=quiz.id, user_id=demo_user.id)
        
        # 6. Submit Answers
        from app.models.quiz import QuizQuestion
        quiz_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).order_by(QuizQuestion.order_index).all()
        
        answers_data = []
        for idx, qq in enumerate(quiz_questions):
            q = qq.question
            correct_opt = next((o for o in q.options if o.is_correct), None)
            wrong_opt = next((o for o in q.options if not o.is_correct), None)
            
            # Simulate 2 correct, 1 wrong
            selected_opt = correct_opt if idx < 2 else wrong_opt
            if selected_opt:
                class MockAnswer:
                    question_id = q.id
                    selected_option_id = selected_opt.id
                    time_taken_seconds = 15
                answers_data.append(MockAnswer())
        
        submit_answers(db, attempt_id=attempt.id, user_id=demo_user.id, answers_data=answers_data)
        
        # 7. Generate Recommendations
        generate_recommendations(db, demo_user.id)
        
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
