from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Quiz(Base):
    __tablename__ = 'quizzes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    lecture_id = Column(Integer, ForeignKey('lectures.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String(500))
    description = Column(Text, nullable=True)
    status = Column(String(20), default='draft')
    num_questions = Column(Integer)
    difficulty = Column(String(20), default='mixed')
    time_limit_minutes = Column(Integer, nullable=True)
    is_adaptive = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lecture = relationship("Lecture", back_populates="quizzes")
    user = relationship("User", back_populates="quizzes")
    quiz_questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = 'quiz_questions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id'))
    question_id = Column(Integer, ForeignKey('questions.id'))
    order_index = Column(Integer)

    quiz = relationship("Quiz", back_populates="quiz_questions")
    question = relationship("Question", back_populates="quiz_questions")

class QuizAttempt(Base):
    __tablename__ = 'quiz_attempts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    score = Column(Integer, nullable=True)
    total_questions = Column(Integer, nullable=True)
    percentage = Column(Float, nullable=True)

    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("User", back_populates="attempts")
    answers = relationship("Answer", back_populates="attempt", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = 'answers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey('quiz_attempts.id'))
    question_id = Column(Integer, ForeignKey('questions.id'))
    selected_option_id = Column(Integer, ForeignKey('question_options.id'), nullable=True)
    is_correct = Column(Boolean, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)

    attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("Question")
    selected_option = relationship("QuestionOption")
