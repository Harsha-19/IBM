from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.concept import Concept
from app.models.lecture import Lecture
from app.ai.provider import get_ai_provider

def extract_concepts(db: Session, lecture_id: int):
    existing = db.query(Concept).filter(Concept.lecture_id == lecture_id).all()
    if existing:
        return existing
    
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
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
    for c in concepts:
        db.refresh(c)
    return concepts

def get_concepts(db: Session, lecture_id: int):
    return db.query(Concept).filter(Concept.lecture_id == lecture_id).all()

def get_concept_map(db: Session, lecture_id: int):
    concepts = db.query(Concept).filter(Concept.lecture_id == lecture_id).all()
    nodes = []
    for c in concepts:
        nodes.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "importance": c.importance,
            "difficulty": c.difficulty,
            "children": []
        })
    return {"nodes": nodes, "lecture_id": lecture_id}
