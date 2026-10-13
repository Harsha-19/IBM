import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class LectureStatus(str, enum.Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'

class Lecture(Base):
    __tablename__ = 'lectures'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String(500))
    description = Column(Text, nullable=True)
    source_type = Column(String(20))
    file_path = Column(String(500), nullable=True)
    transcript = Column(Text)
    word_count = Column(Integer, default=0)
    status = Column(String(20), default=LectureStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="lectures")
    sections = relationship("LectureSection", back_populates="lecture", cascade="all, delete-orphan")
    concepts = relationship("Concept", back_populates="lecture", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="lecture", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="lecture", cascade="all, delete-orphan")

class LectureSection(Base):
    __tablename__ = 'lecture_sections'

    id = Column(Integer, primary_key=True, autoincrement=True)
    lecture_id = Column(Integer, ForeignKey('lectures.id'))
    title = Column(String(500))
    content = Column(Text)
    order_index = Column(Integer)

    lecture = relationship("Lecture", back_populates="sections")
