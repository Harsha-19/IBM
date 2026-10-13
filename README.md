# LectureLens
### AI-Powered Lecture → Knowledge → Quiz → Validation → Adaptive Learning Platform

> **"Don't just generate a quiz. Prove that the quiz is worth taking."**

LectureLens is an academic SaaS platform that transforms educational lecture material (PDFs, DOCX, transcripts, text) into structured knowledge taxonomies, verifies generated questions through an audit gate, and personalizes follow-up quizzes based on weak concepts and learning mastery.

---

## 1. Architecture Overview

```text
LECTURE INPUT (PDF / DOCX / Text)
       ↓
INGESTION & CLEANING ENGINE
       ↓
CONCEPT EXTRACTION & KNOWLEDGE GRAPH
       ↓
AI QUESTION SYNTHESIS
       ↓
MULTI-DIMENSIONAL VALIDATOR GATE (Grounding, Correctness, Distractor Quality, Clarity)
       ↓
QUALITY-GATED QUIZ ENGINE
       ↓
STUDENT ATTEMPTS QUIZ (Timer & Distraction-free UI)
       ↓
BACKEND ANSWER EVALUATION & SCORING
       ↓
MULTI-SIGNAL WEAK TOPIC DETECTION
       ↓
ADAPTIVE RECOMMENDATIONS & FOLLOW-UP QUIZZING
```

### Architectural Principles
1. **No Fake Functionality:** Dynamic analytics, quiz evaluations, and mastery scores originate strictly from the backend database.
2. **Backend as Source of Truth:** Correctness, scoring, and progress calculations are strictly owned by backend services.
3. **Quality-Gated AI:** Raw LLM outputs are never shown directly to learners; only approved questions passing the composite validation threshold enter active quizzes.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React icons
- **Routing:** React Router v6
- **Server State & Data Fetching:** TanStack Query (React Query v5)
- **Client State:** Zustand (for JWT token persistence & auth session)
- **Charts & Visualizations:** Recharts (responsive trends & distributions)
- **Form Validation:** React Hook Form + Zod

### Backend
- **Framework:** Python 3.11+, FastAPI
- **Database & ORM:** PostgreSQL / SQLite with SQLAlchemy 2.0
- **Authentication:** JWT Access Tokens (`python-jose`, bcrypt password hashing)
- **Document Extraction:** PyMuPDF (`fitz`) for PDF, `python-docx` for Word, utf-8 text parsers
- **AI & Validation:** Abstracted `AIProvider` (`MockProvider` for reproducible local runs and `OpenAIProvider`)
- **Testing:** Pytest, pytest-asyncio, FastAPI TestClient

---

## 3. Core Database Models

- `User`: Accounts with role-based access (`student`, `admin`).
- `Lecture`: Uploaded material, transcripts, word counts, and processing states (`pending`, `processing`, `completed`, `failed`).
- `LectureSection`: Structured chunked paragraphs and headings extracted from documents.
- `Concept`: Key topics with importance scores (0-1.0), difficulties (`easy`, `medium`, `hard`), and definitions.
- `Question`: Question texts, types (`multiple_choice`, `true_false`), explanations, and status (`approved`, `review`, `rejected`, `pending`).
- `QuestionOption`: Distractors and correct answer keys.
- `ValidationResult`: Detailed audit records storing Grounding (30%), Correctness (25%), Clarity (15%), Distractor Quality (15%), and Difficulty (15%) metrics with written feedback.
- `Quiz` & `QuizQuestion`: Validated quizzes associated with lectures.
- `QuizAttempt` & `Answer`: Student attempt logs, response times, and percentage scores.
- `LearningProgress`: Longitudinal mastery tracking per concept (attempt counts, correct/incorrect, mastery percentage).
- `Recommendation`: Tailored suggestions (`review`, `practice`, `advance`) prioritized by cognitive gaps.

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- (Optional) Docker & Docker Compose

### Backend Setup
1. Open a terminal in `./backend`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional):
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Populate the database with initial demo data:
   ```bash
   python scripts/seed.py
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   API Documentation is available at `http://127.0.0.1:8000/docs`.

### Frontend Setup
1. Open a terminal in `./frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Access the web application at `http://localhost:3000`.

---

## 5. Demo Credentials

The seed script creates two pre-configured accounts:

| Role | Email | Password |
|---|---|---|
| **Student** | `demo@example.com` | `password123` |
| **Admin / Validator** | `admin@example.com` | `admin123` |

Quick demo fill buttons are built directly into the Login page for rapid evaluation.

---

## 6. Running Tests

### Backend Test Suite
The automated test suite verifies authentication, lecture extraction, validation quality gates, and the end-to-end adaptive learning cycle:
```bash
cd backend
python -m pytest tests/test_backend.py -v
```

### Frontend Typecheck & Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 7. Quality Validator Gate Formula

Each generated question is scored across 5 dimensions:

$$\text{Overall Score} = (0.30 \times \text{Grounding}) + (0.25 \times \text{Correctness}) + (0.15 \times \text{Clarity}) + (0.15 \times \text{Distractor}) + (0.15 \times \text{Difficulty})$$

- $\ge 75$: **APPROVED** (Passed into student quiz pool)
- $60 - 74$: **REVIEW** (Flagged for human/admin audit or regeneration)
- $< 60$: **REJECTED** (Discarded; never shown to students)

---

## 8. Docker Deployment

To launch the full application with PostgreSQL:
```bash
copy .env.example .env
# Edit .env: set POSTGRES_PASSWORD, DATABASE_URL using the format shown there
# (with the same password), and a unique, random SECRET_KEY before starting.
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
