from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Concept(Base):
    __tablename__ = 'concepts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    lecture_id = Column(Integer, ForeignKey('lectures.id'))
    name = Column(String(255))
    description = Column(Text)
    importance = Column(Float, default=0.5)
    difficulty = Column(String(20), default='medium')
    source_reference = Column(Text, nullable=True)
    parent_concept_id = Column(Integer, ForeignKey('concepts.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lecture = relationship("Lecture", back_populates="concepts")
    parent_concept = relationship("Concept", remote_side=[id], back_populates="sub_concepts")
    sub_concepts = relationship("Concept", back_populates="parent_concept", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="concept")
    learning_progress = relationship("LearningProgress", back_populates="concept", cascade="all, delete-orphan")
