import pytest
import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.session import Base, get_db
from app.main import app
from app.models.user import User
from app.models.lecture import Lecture, LectureStatus
from app.models.concept import Concept
from app.models.question import Question, QuestionStatus, ValidationResult
from app.models.quiz import Quiz, QuizAttempt
from app.models.learning import LearningProgress, Recommendation
from app.auth.service import get_password_hash, verify_password, create_access_token

# Test SQLite in-memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db):
    user = User(
        name="Test Student",
        email="student_test@example.com",
        password_hash=get_password_hash("password123"),
        role="student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}

# --- 1. Authentication Tests ---
def test_password_hashing():
    pw = "secretpassword"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_user_registration_and_login(client):
    reg_res = client.post("/api/auth/register", json={
        "name": "New User",
        "email": "newuser@example.com",
        "password": "mypassword"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert reg_data["email"] == "newuser@example.com"
    
    login_res = client.post("/api/auth/login", json={
        "email": "newuser@example.com",
        "password": "mypassword"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "newuser@example.com"

# --- 2. Lecture Processing & Extraction Tests ---
def test_lecture_create_and_process(client, auth_headers):
    ml_lecture_content = (
        "Supervised learning maps an input to an output based on example pairs. "
        "Unsupervised learning discovers intrinsic structures in unlabeled data. "
        "K-means clustering partitions data points into k distinct non-overlapping clusters."
    )
    
    # Create lecture
    create_res = client.post(
        "/api/lectures/",
        headers=auth_headers,
        data={
            "title": "Machine Learning Fundamentals",
            "source_type": "text",
            "content": ml_lecture_content,
            "description": "Basics of ML"
        }
    )
    assert create_res.status_code == 200
    lecture = create_res.json()
    lecture_id = lecture["id"]
    assert lecture["title"] == "Machine Learning Fundamentals"
    
    # Process lecture
    proc_res = client.post(f"/api/lectures/{lecture_id}/process", headers=auth_headers)
    assert proc_res.status_code == 200
    assert proc_res.json()["status"] == "completed"
    
    # Verify concepts were extracted
    concepts_res = client.get(f"/api/concepts/{lecture_id}/concepts", headers=auth_headers)
    assert concepts_res.status_code == 200
    concepts = concepts_res.json()["concepts"]
    assert len(concepts) > 0
    
    # Verify concept map
    map_res = client.get(f"/api/concepts/{lecture_id}/concept-map", headers=auth_headers)
    assert map_res.status_code == 200
    assert "nodes" in map_res.json()

# --- 3. Validation Engine Tests ---
def test_question_validation_gate(client, auth_headers, db):
    # Verify validator stats endpoint
    stats_res = client.get("/api/validation/stats", headers=auth_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_generated" in stats
    assert "total_approved" in stats
    assert "average_score" in stats

    # Verify questions for review
    q_res = client.get("/api/validation/questions", headers=auth_headers)
    assert q_res.status_code == 200
    questions = q_res.json()
    assert isinstance(questions, list)
    
    if len(questions) > 0:
        q_id = questions[0]["id"]
        # Test admin approve action
        appr_res = client.post(f"/api/validation/questions/{q_id}/approve", headers=auth_headers)
        assert appr_res.status_code == 200
        assert appr_res.json()["status"] == "approved"
        
        # Test admin reject action
        rej_res = client.post(f"/api/validation/questions/{q_id}/reject", headers=auth_headers)
        assert rej_res.status_code == 200
        assert rej_res.json()["status"] == "rejected"

# --- 4. Complete End-to-End Workflow: Quiz Attempt -> Scoring -> Adaptive Learning ---
def test_full_adaptive_learning_flow(client, auth_headers):
    # 1. Create and process lecture
    lec_res = client.post(
        "/api/lectures/",
        headers=auth_headers,
        data={
            "title": "Neural Networks Deep Dive",
            "source_type": "text",
            "content": "Neural networks use backpropagation to minimize loss functions through gradient descent.",
            "description": "Deep learning intro"
        }
    )
    lecture_id = lec_res.json()["id"]
    client.post(f"/api/lectures/{lecture_id}/process", headers=auth_headers)
    
    # 2. Create quiz
    quiz_res = client.post(
        "/api/quizzes/",
        headers=auth_headers,
        json={
            "lecture_id": lecture_id,
            "num_questions": 3,
            "is_adaptive": True
        }
    )
    assert quiz_res.status_code == 200
    quiz_id = quiz_res.json()["id"]
    
    # 3. Start attempt
    start_res = client.post(f"/api/quizzes/{quiz_id}/attempts", headers=auth_headers)
    assert start_res.status_code == 200
    attempt_data = start_res.json()
    attempt_id = attempt_data["attempt_id"]
    questions = attempt_data["questions"]
    assert len(questions) > 0
    
    # 4. Submit answers
    answers = []
    for qq in questions:
        q = qq["question"]
        selected_option = q["options"][0]["id"] if q["options"] else None
        answers.append({
            "question_id": q["id"],
            "selected_option_id": selected_option,
            "time_taken_seconds": 12
        })
        
    submit_res = client.post(
        f"/api/quizzes/attempts/{attempt_id}/submit",
        headers=auth_headers,
        json={"answers": answers}
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert "score" in result
    assert "percentage" in result
    assert "concept_performance" in result
    
    # 5. Verify analytics dashboard reflects attempt
    dash_res = client.get("/api/analytics/dashboard", headers=auth_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["stats"]["total_quizzes_taken"] >= 1
    
    # 6. Verify progress & weak topics endpoint
    prog_res = client.get("/api/analytics/progress", headers=auth_headers)
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert "mastery_distribution" in prog_data
    
    # 7. Generate adaptive recommendations
    rec_res = client.get("/api/recommendations/", headers=auth_headers)
    assert rec_res.status_code == 200
