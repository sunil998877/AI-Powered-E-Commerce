import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent
DATA_FILE = ROOT_DIR / "data" / "ecommerce.json"

env_path = BACKEND_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687").strip()
    NEO4J_USERNAME: str = os.getenv("NEO4J_USERNAME", "neo4j").strip()
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password123").strip()
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173").strip()
    DATA_PATH: Path = DATA_FILE


settings = Settings()
