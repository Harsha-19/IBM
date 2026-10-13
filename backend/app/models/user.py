from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(20), default='student')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lectures = relationship("Lecture", back_populates="user")
    quizzes = relationship("Quiz", back_populates="user")
    attempts = relationship("QuizAttempt", back_populates="user")
    learning_progress = relationship("LearningProgress", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
