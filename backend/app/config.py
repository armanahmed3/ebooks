import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Evidence Vault Base
EVIDENCE_DIR = BASE_DIR / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

# Create platform subdirectories in Evidence Vault
PLATFORMS = [
    "amazon", "etsy", "ebay", "gumroad", "payhip",
    "goodreads", "udemy", "youtube", "reddit", "trends", "pinterest"
]
for p in PLATFORMS:
    (EVIDENCE_DIR / p).mkdir(parents=True, exist_ok=True)

# Generated assets directory
ASSETS_DIR = BASE_DIR / "generated_assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "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")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
GLM_MODEL = "z-ai/glm-5.3"
PORT = int(os.getenv("PORT", 8000))

# AI Models
PRIMARY_MODEL = GLM_MODEL
DEEP_RESEARCH_MODEL = GLM_MODEL
FREELLMAPI_BASE_URL = os.getenv("FREELLMAPI_BASE_URL", "http://localhost:3001/v1")
FREELLMAPI_API_KEY = os.getenv("FREELLMAPI_API_KEY", "freellmapi-4437a0543ea2707cc8fbc53d4e1b2df7bd52dc4f76e8d97f")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "@cf/black-forest-labs/flux-1-schnell")

# Browser delays & Rate limits
MIN_ACTION_DELAY_SEC = 2.0
MAX_ACTION_DELAY_SEC = 5.0
CACHE_EXPIRY_HOURS = 24

# Site specific rate limit (requests / hour)
MAX_PAGE_LOADS_PER_HOUR = 30
