from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class LearningProgress(Base):
    __tablename__ = 'learning_progress'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    concept_id = Column(Integer, ForeignKey('concepts.id'))
    mastery_score = Column(Float, default=0)
    attempt_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    incorrect_count = Column(Integer, default=0)
    last_attempt_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="learning_progress")
    concept = relationship("Concept", back_populates="learning_progress")

class Recommendation(Base):
    __tablename__ = 'recommendations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    concept_id = Column(Integer, ForeignKey('concepts.id'))
    recommendation_type = Column(String(50))
    reason = Column(Text)
    priority = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    concept = relationship("Concept")
