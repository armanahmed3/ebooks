import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.config import (
    NVIDIA_API_KEY, NVIDIA_BASE_URL, GLM_MODEL,
    GEMINI_API_KEY, PRIMARY_MODEL, DEEP_RESEARCH_MODEL
)
from app.services.ai_router import ai_router

logger = logging.getLogger("ai_service")

class AIService:
    """
    Unified AI Service bridge that synchronizes with AIRouterService
    supporting OmniRoute, FreeLLMAPI, NVIDIA NIM (GLM-5.3), and Google Gemini.
    """
    def __init__(self):
        self.nvidia_api_key = NVIDIA_API_KEY
        self.nvidia_base_url = NVIDIA_BASE_URL
        self.glm_model = GLM_MODEL
        self.gemini_api_key = GEMINI_API_KEY

    def set_api_key(self, api_key: str):
        if api_key.startswith("nvapi-"):
            self.nvidia_api_key = api_key
            ai_router.configure(provider="nvidia", api_key=api_key)
        else:
            self.gemini_api_key = api_key
            ai_router.configure(provider="gemini", api_key=api_key)

    def is_connected(self) -> bool:
        return True

    async def test_connection(self) -> Dict[str, Any]:
        """Tests live inference with current active provider or NVIDIA/Gemini."""
        return await ai_router.test_provider(
            provider=ai_router.provider,
            base_url=ai_router.omniroute_base_url if ai_router.provider == "omniroute" else ai_router.freellmapi_base_url,
            api_key=ai_router.custom_api_key,
            model=ai_router.selected_model
        )

    async def generate_text(self, prompt: str, model_name: Optional[str] = None, retries: int = 2) -> str:
        """Generate text using unified AI router with automatic failover."""
        return await ai_router.generate_text(
            prompt=prompt,
            system_prompt=(
                "You are a bestselling non-fiction author and master systems architect. "
                "You write direct, high-utility, publication-ready book chapters. "
                "Output ONLY the final published book text. "
                "NEVER output internal thinking, reasoning process, or conversational intro."
            ),
            max_tokens=2048,
            temperature=0.35
        )

# Global unified AI service instance
gemini_service = AIService()
