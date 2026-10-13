import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

write_file(r"d:\IBM\backend\app\ai\__init__.py", "")

provider = '''from abc import ABC, abstractmethod
from typing import List, Dict, Any

class AIProvider(ABC):
    @abstractmethod
    def extract_concepts(self, text: str) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def generate_questions(self, text: str) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def validate_question(self, question: Dict[str, Any], text: str) -> Dict[str, Any]:
        pass

class MockProvider(AIProvider):
    def extract_concepts(self, text: str) -> List[Dict[str, Any]]:
        return [
            {"name": "Machine Learning", "description": "Subset of AI", "importance": 0.9, "difficulty": "hard"},
            {"name": "K-Means Clustering", "description": "Unsupervised algorithm", "importance": 0.8, "difficulty": "medium"}
        ]
        
    def generate_questions(self, text: str) -> List[Dict[str, Any]]:
        return [
            {
                "question_text": "What is K-Means Clustering?",
                "question_type": "multiple_choice",
                "difficulty": "medium",
                "options": [
                    {"text": "Supervised algorithm", "is_correct": False},
                    {"text": "Unsupervised algorithm", "is_correct": True}
                ]
            }
        ]
        
    def validate_question(self, question: Dict[str, Any], text: str) -> Dict[str, Any]:
        # returns validation stats
        return {
            "grounding_score": 0.9,
            "correctness_score": 0.9,
            "clarity_score": 0.9,
            "difficulty_score": 0.8,
            "distractor_score": 0.8,
            "overall_score": 86.0
        }

class OpenAIProvider(AIProvider):
    # Implemented for future use
    def extract_concepts(self, text: str) -> List[Dict[str, Any]]:
        return []
        
    def generate_questions(self, text: str) -> List[Dict[str, Any]]:
        return []
        
    def validate_question(self, question: Dict[str, Any], text: str) -> Dict[str, Any]:
        return {}

def get_ai_provider() -> AIProvider:
    return MockProvider()
'''
write_file(r"d:\IBM\backend\app\ai\provider.py", provider)

write_file(r"d:\IBM\backend\app\ai\prompts\__init__.py", "")
write_file(r"d:\IBM\backend\app\ai\prompts\concept_extraction.py", 'PROMPT = "Extract concepts from text."')
write_file(r"d:\IBM\backend\app\ai\prompts\question_generation.py", 'PROMPT = "Generate questions."')
write_file(r"d:\IBM\backend\app\ai\prompts\question_validation.py", 'PROMPT = "Validate questions."')
write_file(r"d:\IBM\backend\app\ai\prompts\recommendation.py", 'PROMPT = "Give recommendations."')

print("Batch 3 created.")
