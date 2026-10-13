from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.auth.service import get_current_user
from app.services.recommendation_service import get_recommendations, generate_recommendations, complete_recommendation

router = APIRouter()

@router.get("")
@router.get("/", include_in_schema=False)
def list_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_recommendations(db, current_user.id)

@router.post("/generate")
def trigger_recommendation_generation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recs = generate_recommendations(db, current_user.id)
    return {"count": len(recs), "status": "generated"}

@router.post("/{recommendation_id}/complete")
def mark_recommendation_complete(recommendation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complete_recommendation(db, recommendation_id, current_user.id)
    return {"status": "completed"}
