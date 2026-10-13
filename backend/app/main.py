from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, lectures, concepts, questions, quizzes, analytics, validation, recommendations
from app.database.session import engine, Base
from app.config.settings import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LectureLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(lectures.router, prefix="/api/lectures", tags=["lectures"])
app.include_router(concepts.router, prefix="/api/concepts", tags=["concepts"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(validation.router, prefix="/api/validation", tags=["validation"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to LectureLens API"}
