import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Load .env file from backend/ or project root if it exists
backend_env = BASE_DIR / ".env"
root_env = PROJECT_ROOT / ".env"
if backend_env.exists():
    load_dotenv(backend_env, override=True)
elif root_env.exists():
    load_dotenv(root_env, override=True)
else:
    load_dotenv(override=True)  # Fallback to default search

# Environment configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/gemstones.db")

# Simulation settings
MOCK_NETWORK_LATENCY_MS = int(os.getenv("MOCK_NETWORK_LATENCY_MS", "600"))

# CORS settings
CORS_ORIGINS = [
    origin.strip() 
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

# Uploads directory
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Sample docs directory
SAMPLE_DOCS_DIR = PROJECT_ROOT / "sample_docs"
SAMPLE_DOCS_DIR.mkdir(parents=True, exist_ok=True)
