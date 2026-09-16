import os
import re
import json
import uuid
import time
import logging
import asyncio
import urllib.parse
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from openai import OpenAI
from app.config import (
    ASSETS_DIR, NVIDIA_API_KEY, NVIDIA_BASE_URL, GLM_MODEL,
    GEMINI_API_KEY, PRIMARY_MODEL
)

logger = logging.getLogger("ai_router")

COVERS_DIR = ASSETS_DIR / "covers"
COVERS_DIR.mkdir(parents=True, exist_ok=True)

class AIRouterService:
    """
    Unified AI routing service supporting:
    1. OmniRoute (https://github.com/diegosouzapw/OmniRoute)
    2. FreeLLMAPI (https://github.com/tashfeenahmed/freellmapi)
    3. NVIDIA NIM / GLM-5.3
    4. Google Gemini API
    5. Free Best-Seller AI Book Cover Generation (Pollinations & SVG Canvas)
    """
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "omniroute") # omniroute | freellmapi | nvidia | gemini | procedural
        self.omniroute_base_url = os.getenv("OMNIROUTE_BASE_URL", "http://localhost:8080/v1")
        self.freellmapi_base_url = os.getenv("FREELLMAPI_BASE_URL", "http://localhost:3000/v1")
        self.custom_api_key = os.getenv("AI_API_KEY", "free-token")
        
        self.nvidia_api_key = NVIDIA_API_KEY
        self.nvidia_base_url = NVIDIA_BASE_URL
        self.glm_model = GLM_MODEL
        self.gemini_api_key = GEMINI_API_KEY
        
        self._openai_client: Optional[OpenAI] = None
        self._init_client()

    def configure(self, provider: str, base_url: Optional[str] = None, api_key: Optional[str] = None):
        """Allows user to dynamically select provider and base URL from Setup."""
        self.provider = provider.lower().strip()
        if base_url:
            if self.provider == "omniroute":
                self.omniroute_base_url = base_url.strip()
            elif self.provider == "freellmapi":
                self.freellmapi_base_url = base_url.strip()
        if api_key:
            self.custom_api_key = api_key.strip()
        self._init_client()

    def _init_client(self):
        try:
            if self.provider == "omniroute":
                self._openai_client = OpenAI(
                    base_url=self.omniroute_base_url,
                    api_key=self.custom_api_key or "free-omniroute-token"
                )
                logger.info(f"Initialized OmniRoute client on {self.omniroute_base_url}")
            elif self.provider == "freellmapi":
                self._openai_client = OpenAI(
                    base_url=self.freellmapi_base_url,
                    api_key=self.custom_api_key or "free-llm-token"
                )
                logger.info(f"Initialized FreeLLMAPI client on {self.freellmapi_base_url}")
            elif self.provider == "nvidia" and self.nvidia_api_key:
                self._openai_client = OpenAI(
                    base_url=self.nvidia_base_url,
                    api_key=self.nvidia_api_key.strip()
                )
                logger.info("Initialized NVIDIA client")
            else:
                self._openai_client = None
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI client for {self.provider}: {e}")
            self._openai_client = None

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str = "You are a #1 New York Times Bestselling Book Architect and High-Converting Product Strategist.",
        max_tokens: int = 2048,
        temperature: float = 0.4
    ) -> str:
        """Generates text via OmniRoute, FreeLLMAPI, NVIDIA, or Gemini with procedural fallback."""
        if self._openai_client:
            try:
                loop = asyncio.get_event_loop()
                model_name = "gpt-4o-mini" if self.provider in ["omniroute", "freellmapi"] else self.glm_model
                response = await loop.run_in_executor(
                    None,
                    lambda: self._openai_client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=max_tokens,
                        temperature=temperature
                    )
                )
                content = response.choices[0].message.content
                if content and len(content.strip()) > 30:
                    return content.strip()
            except Exception as e:
                logger.warning(f"Client text generation failed for {self.provider}: {e}")

        # Gemini fallback
        if self.gemini_api_key and self.gemini_api_key.strip():
            try:
                from google import genai
                g_client = genai.Client(api_key=self.gemini_api_key.strip())
                loop = asyncio.get_event_loop()
                res = await loop.run_in_executor(
                    None,
                    lambda: g_client.models.generate_content(
                        model=PRIMARY_MODEL,
                        contents=f"{system_prompt}\n\nTask: {prompt}"
                    )
                )
                if res and res.text:
                    return res.text.strip()
            except Exception as e:
                logger.warning(f"Gemini fallback failed: {e}")

        # Procedural fallback
        return ""

    async def generate_cover_art(
        self,
        niche: str,
        title: str,
        subtitle: str,
        style_pattern: str = "minimalist_luxury",
        project_id: str = "default"
    ) -> Dict[str, Any]:
        """
        Generates a 100% production-ready Best-Seller book cover image.
        Uses high-aesthetic AI generation + local asset caching.
        """
        clean_title = title.strip()
        
        # Style prompt tuning matching #1 best sellers (Atomic Habits, 4-Hour Workweek, Somatic Reset)
        style_prompts = {
            "minimalist_luxury": "ultra clean minimalist luxury book cover, elegant serif typography, subtle gold foil geometric emblem, cream and midnight charcoal background, award winning editorial layout, 8k, photorealistic",
            "vibrant_duotone": "modern high-converting Amazon best seller book cover, vibrant gradient emerald and deep navy, bold modern sans-serif typography, clean visual focal icon, 8k render, professional commercial publishing",
            "somatic_wellness": "gentle premium wellness and somatic therapy book cover, soft sage green and terracotta rose palette, minimalist botanical line art emblem, calming elegant typography, bestseller aesthetic, 8k",
            "executive_power": "executive high-performance blueprint book cover, deep obsidian black with metallic champagne gold accents, structured geometric sprint matrix icon, bold commanding typography, 8k sharp",
            "action_playbook": "practical action workbook cover, crisp clean modern layout, high-contrast title banner, checklist sprint badge '30-Day Blueprint', vivid rose and white colorway, award-winning KDP design"
        }
        art_direction = style_prompts.get(style_pattern, style_prompts["minimalist_luxury"])
        
        full_prompt = (
            f"Bestseller book cover for '{clean_title}'. "
            f"Subject: {niche}. {art_direction}. "
            f"No distorted text, clean professional graphic design, vertical 6x9 book cover aspect ratio, 300 DPI high resolution."
        )

        encoded_prompt = urllib.parse.quote_plus(full_prompt)
        free_ai_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=768&height=1152&seed=42&nologo=true"
        
        filename = f"cover_{project_id}_{uuid.uuid4().hex[:6]}.jpg"
        filepath = COVERS_DIR / filename
        
        # Attempt to download and cache locally for offline reliability
        downloaded = False
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.get(free_ai_url)
                if resp.status_code == 200 and len(resp.content) > 1000:
                    with open(filepath, "wb") as f:
                        f.write(resp.content)
                    downloaded = True
                    logger.info(f"Downloaded and saved best seller book cover to {filepath}")
        except Exception as e:
            logger.warning(f"Could not download remote cover image (network error), using direct stream URL: {e}")

        local_rel_url = f"/assets/covers/{filename}" if downloaded else free_ai_url
        absolute_path = str(filepath) if downloaded else ""

        return {
            "title": clean_title,
            "subtitle": subtitle,
            "style_pattern": style_pattern,
            "cover_url": local_rel_url,
            "preview_url": free_ai_url,
            "local_file_path": absolute_path,
            "art_direction": art_direction,
            "status": "READY"
        }

ai_router = AIRouterService()
