import enum
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class QuestionStatus(str, enum.Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    REVIEW = 'review'

class Question(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    lecture_id = Column(Integer, ForeignKey('lectures.id'))
    concept_id = Column(Integer, ForeignKey('concepts.id'), nullable=True)
    question_text = Column(Text)
    question_type = Column(String(30))
    difficulty = Column(String(20))
    explanation = Column(Text, nullable=True)
    source_reference = Column(Text, nullable=True)
    status = Column(String(20), default=QuestionStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    lecture = relationship("Lecture", back_populates="questions")
    concept = relationship("Concept", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    validation_results = relationship("ValidationResult", back_populates="question", cascade="all, delete-orphan")
    quiz_questions = relationship("QuizQuestion", back_populates="question")

class QuestionOption(Base):
    __tablename__ = 'question_options'

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey('questions.id'))
    option_text = Column(Text)
    is_correct = Column(Boolean, default=False)
    order_index = Column(Integer)

    question = relationship("Question", back_populates="options")

class ValidationResult(Base):
    __tablename__ = 'validation_results'

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey('questions.id'))
    grounding_score = Column(Float)
    correctness_score = Column(Float)
    clarity_score = Column(Float)
    difficulty_score = Column(Float)
    distractor_score = Column(Float)
    overall_score = Column(Float)
    validation_status = Column(String(20))
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="validation_results")
