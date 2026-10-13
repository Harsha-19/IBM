from abc import ABC, abstractmethod
import random

class AIProvider(ABC):
    @abstractmethod
    def extract_concepts(self, text: str) -> list:
        pass
    @abstractmethod
    def generate_questions(self, text: str) -> list:
        pass
    @abstractmethod
    def validate_question(self, question_text: str) -> dict:
        pass

class MockProvider(AIProvider):
    def extract_concepts(self, text: str) -> list:
        concepts = [
            {"name": "Supervised Learning", "description": "Learning with labeled data.", "importance": 0.9, "difficulty": "medium"},
            {"name": "Unsupervised Learning", "description": "Learning with unlabeled data.", "importance": 0.8, "difficulty": "hard"},
            {"name": "K-Means Clustering", "description": "A popular unsupervised clustering algorithm.", "importance": 0.7, "difficulty": "medium"},
            {"name": "Neural Networks", "description": "Deep learning models inspired by the brain.", "importance": 0.9, "difficulty": "hard"},
            {"name": "Reinforcement Learning", "description": "Learning by interacting with an environment.", "importance": 0.85, "difficulty": "hard"}
        ]
        return concepts

    def generate_questions(self, text: str) -> list:
        questions = [
            {
                "question_text": "What is Supervised Learning?",
                "question_type": "multiple_choice",
                "difficulty": "easy",
                "explanation": "Supervised learning uses labeled datasets.",
                "options": [
                    {"text": "Learning with labeled data", "is_correct": True},
                    {"text": "Learning with unlabeled data", "is_correct": False},
                    {"text": "Learning by trial and error", "is_correct": False},
                    {"text": "None of the above", "is_correct": False}
                ]
            },
            {
                "question_text": "K-Means is an example of which type of learning?",
                "question_type": "multiple_choice",
                "difficulty": "medium",
                "explanation": "K-Means is a clustering algorithm, which is unsupervised.",
                "options": [
                    {"text": "Supervised", "is_correct": False},
                    {"text": "Unsupervised", "is_correct": True},
                    {"text": "Reinforcement", "is_correct": False},
                    {"text": "Semi-supervised", "is_correct": False}
                ]
            },
            {
                "question_text": "Neural Networks are inspired by biological brains.",
                "question_type": "true_false",
                "difficulty": "easy",
                "explanation": "Artificial Neural Networks are loosely inspired by biological neural networks.",
                "options": [
                    {"text": "True", "is_correct": True},
                    {"text": "False", "is_correct": False}
                ]
            }
        ]
        return questions

    def validate_question(self, question_text: str) -> dict:
        score = random.uniform(50, 100)
        return {
            "grounding_score": score / 100.0,
            "correctness_score": score / 100.0,
            "clarity_score": score / 100.0,
            "difficulty_score": score / 100.0,
            "distractor_score": score / 100.0,
            "overall_score": score,
            "feedback": "Looks good." if score >= 75 else "Needs improvement."
        }

def get_ai_provider() -> AIProvider:
    from app.config.settings import settings
    if settings.AI_PROVIDER.lower() == 'mock':
        return MockProvider()
    return MockProvider() # fallback
