import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

write_file(r"d:\IBM\backend\app\services\__init__.py", "")

lecture_service = '''import PyPDF2
import docx
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.lecture import Lecture, LectureSection, LectureStatus
from typing import Optional

def extract_text_from_upload(file: UploadFile) -> str:
    if file.filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(file.file)
        return " ".join([page.extract_text() for page in reader.pages if page.extract_text()])
    elif file.filename.endswith(".docx"):
        doc = docx.Document(file.file)
        return " ".join([p.text for p in doc.paragraphs])
    elif file.filename.endswith(".txt"):
        return file.file.read().decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

def create_lecture(db: Session, user_id: int, title: str, source_type: str, content: Optional[str] = None, file: Optional[UploadFile] = None) -> Lecture:
    if file:
        content = extract_text_from_upload(file)
    if not content:
        raise HTTPException(status_code=400, detail="No content provided")
        
    lecture = Lecture(
        user_id=user_id,
        title=title,
        source_type=source_type,
        transcript=content,
        word_count=len(content.split()),
        status=LectureStatus.COMPLETED
    )
    db.add(lecture)
    db.commit()
    db.refresh(lecture)
    
    # Section dummy
    section = LectureSection(lecture_id=lecture.id, title="Main Section", content=content, order_index=0)
    db.add(section)
    db.commit()
    return lecture

def get_lecture(db: Session, lecture_id: int) -> Lecture:
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return lecture
'''
write_file(r"d:\IBM\backend\app\services\lecture_service.py", lecture_service)

concept_service = '''from sqlalchemy.orm import Session
from app.models.lecture import Lecture
from app.models.concept import Concept
from app.ai.provider import get_ai_provider

def extract_concepts(db: Session, lecture_id: int):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
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
    return concepts
'''
write_file(r"d:\IBM\backend\app\services\concept_service.py", concept_service)

question_service = '''from sqlalchemy.orm import Session
from app.models.lecture import Lecture
from app.models.question import Question, QuestionOption, QuestionStatus
from app.models.concept import Concept
from app.ai.provider import get_ai_provider

def generate_questions(db: Session, lecture_id: int):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    provider = get_ai_provider()
    questions_data = provider.generate_questions(lecture.transcript)
    
    questions = []
    for q_data in questions_data:
        q = Question(
            lecture_id=lecture.id,
            question_text=q_data['question_text'],
            question_type=q_data.get('question_type', 'multiple_choice'),
            difficulty=q_data.get('difficulty', 'medium'),
            status=QuestionStatus.PENDING
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        
        for idx, opt_data in enumerate(q_data.get('options', [])):
            opt = QuestionOption(
                question_id=q.id,
                option_text=opt_data['text'],
                is_correct=opt_data['is_correct'],
                order_index=idx
            )
            db.add(opt)
        db.commit()
        questions.append(q)
    return questions
'''
write_file(r"d:\IBM\backend\app\services\question_service.py", question_service)

print("Batch 2 created.")
