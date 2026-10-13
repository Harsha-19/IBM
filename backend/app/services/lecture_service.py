from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.models.lecture import Lecture, LectureSection, LectureStatus
import os
import io

def extract_text_from_file(file: UploadFile) -> str:
    content_bytes = file.file.read()
    filename = (file.filename or "").lower()
    
    extracted_text = ""
    if filename.endswith(".pdf"):
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=content_bytes, filetype="pdf")
            pages_text = []
            for page in doc:
                text = page.get_text()
                if text:
                    pages_text.append(text)
            extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract PDF text: {str(e)}")
    elif filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n\n".join(paragraphs)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract DOCX text: {str(e)}")
    else:
        # Default text / txt
        try:
            extracted_text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = content_bytes.decode("latin-1", errors="ignore")
            
    return extracted_text.strip()

def create_sections_for_lecture(db: Session, lecture: Lecture):
    if not lecture.transcript:
        return
    # Split by double newlines or headers
    raw_blocks = [b.strip() for b in lecture.transcript.split("\n\n") if b.strip()]
    if not raw_blocks:
        raw_blocks = [lecture.transcript]
    
    # Group blocks into coherent sections
    sections = []
    chunk_size = max(1, len(raw_blocks) // 4) if len(raw_blocks) > 4 else 1
    
    for i in range(0, len(raw_blocks), chunk_size):
        chunk = raw_blocks[i:i + chunk_size]
        title = chunk[0][:60].strip()
        if len(chunk[0]) > 60:
            title += "..."
        section_content = "\n\n".join(chunk)
        sec = LectureSection(
            lecture_id=lecture.id,
            title=title if title else f"Section {len(sections) + 1}",
            content=section_content,
            order_index=len(sections)
        )
        db.add(sec)
        sections.append(sec)
    db.commit()

def create_lecture(db: Session, user_id: int, title: str, source_type: str, content: str = None, file: UploadFile = None, description: str = None):
    lecture = Lecture(
        user_id=user_id,
        title=title,
        description=description,
        source_type=source_type,
        status=LectureStatus.PENDING.value
    )
    
    if content:
        lecture.transcript = content.strip()
    elif file:
        lecture.transcript = extract_text_from_file(file)
    else:
        lecture.transcript = ""
        
    lecture.word_count = len(lecture.transcript.split()) if lecture.transcript else 0
        
    db.add(lecture)
    db.commit()
    db.refresh(lecture)
    
    # Automatically generate structured sections
    create_sections_for_lecture(db, lecture)
    
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
