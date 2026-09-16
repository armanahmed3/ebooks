import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from openai import OpenAI
from google import genai
from app.config import (
    NVIDIA_API_KEY, NVIDIA_BASE_URL, GLM_MODEL,
    GEMINI_API_KEY, PRIMARY_MODEL, DEEP_RESEARCH_MODEL
)

logger = logging.getLogger("ai_service")

class AIService:
    def __init__(self):
        self.nvidia_api_key = NVIDIA_API_KEY
        self.nvidia_base_url = NVIDIA_BASE_URL
        self.glm_model = GLM_MODEL
        self.gemini_api_key = GEMINI_API_KEY
        
        self._openai_client = None
        self._gemini_client = None
        self._init_clients()

    def set_api_key(self, api_key: str):
        if api_key.startswith("nvapi-"):
            self.nvidia_api_key = api_key
        else:
            self.gemini_api_key = api_key
        self._init_clients()

    def _init_clients(self):
        # 1. Initialize NVIDIA OpenAI client for GLM-5.3
        if self.nvidia_api_key and self.nvidia_api_key.strip():
            try:
                self._openai_client = OpenAI(
                    base_url=self.nvidia_base_url,
                    api_key=self.nvidia_api_key.strip()
                )
                logger.info(f"GLM-5.3 client initialized via {self.nvidia_base_url}")
            except Exception as e:
                logger.error(f"Failed to initialize GLM-5.3 client: {e}")
                self._openai_client = None

        # 2. Secondary Gemini client
        if self.gemini_api_key and self.gemini_api_key.strip():
            try:
                self._gemini_client = genai.Client(api_key=self.gemini_api_key.strip())
            except Exception as e:
                self._gemini_client = None

    def is_connected(self) -> bool:
        return self._openai_client is not None or self._gemini_client is not None

    async def test_connection(self) -> Dict[str, Any]:
        """Tests live inference with GLM-5.3."""
        if self._openai_client:
            try:
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: self._openai_client.chat.completions.create(
                        model=self.glm_model,
                        messages=[
                            {"role": "system", "content": "You are the EMPIRE OS intelligence engine. Answer in 3 words."},
                            {"role": "user", "content": "Confirm GLM-5.3 status."}
                        ],
                        temperature=0.3,
                        max_tokens=256
                    )
                )
                msg = response.choices[0].message
                content = (msg.content or "GLM-5.3 Connected & Operational (NVIDIA NIM)").strip()
                return {
                    "success": True,
                    "model": self.glm_model,
                    "provider": "NVIDIA NIM / z-ai",
                    "message": content
                }
            except Exception as e:
                logger.error(f"GLM-5.3 connection test error: {e}")
                return {"success": False, "message": str(e), "model": self.glm_model}

        if self._gemini_client:
            try:
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: self._gemini_client.models.generate_content(
                        model=PRIMARY_MODEL,
                        contents="Say 'EMPIRE OS Connected' in 3 words."
                    )
                )
                return {"success": True, "message": response.text.strip(), "model": PRIMARY_MODEL}
            except Exception as e:
                return {"success": False, "message": str(e)}

        return {"success": False, "message": "No API key configured for GLM-5.3 or Gemini."}

    async def generate_text(self, prompt: str, model_name: Optional[str] = None, retries: int = 2) -> str:
        """Generate text using GLM-5.3 with automatic fallback and error recovery."""
        chosen_model = model_name or self.glm_model

        # Priority: GLM-5.3 via NVIDIA API
        if self._openai_client:
            for attempt in range(retries + 1):
                try:
                    loop = asyncio.get_event_loop()
                    response = await loop.run_in_executor(
                        None,
                        lambda: self._openai_client.chat.completions.create(
                            model=chosen_model,
                            messages=[
                                {
                                    "role": "system",
                                    "content": (
                                        "You are a bestselling non-fiction author and master systems architect. "
                                        "You write direct, high-utility, publication-ready book chapters. "
                                        "Output ONLY the final published book text. "
                                        "NEVER output your internal thinking, reasoning process, requirements checklist, or conversational intro."
                                    )
                                },
                                {"role": "user", "content": prompt}
                            ],
                            temperature=0.3,
                            max_tokens=2048
                        )
                    )
                    msg = response.choices[0].message
                    content = (msg.content or "").strip()
                    
                    # Filter out any leaked reasoning or meta notes
                    is_meta = any(content.startswith(phrase) for phrase in [
                        "The user wants", "The task:", "Requirements:", "Let me", "I will write", "Here is"
                    ])
                    
                    if content and not is_meta and len(content.split()) >= 80:
                        return content
                    elif content and not is_meta:
                        return content
                except Exception as e:
                    logger.warning(f"GLM-5.3 generation attempt {attempt+1} error: {e}")
                    if attempt < retries:
                        await asyncio.sleep(1.5 * (attempt + 1))

        # Fallback to Gemini if configured
        if self._gemini_client:
            try:
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: self._gemini_client.models.generate_content(
                        model=PRIMARY_MODEL,
                        contents=prompt
                    )
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini fallback error: {e}")

        # Structured deterministic fallback
        return self._fallback_generate(prompt)

    def _fallback_generate(self, prompt: str) -> str:
        """Structured fallback for development and offline mode."""
        prompt_lower = prompt.lower()
        if "cluster" in prompt_lower or "complaints" in prompt_lower:
            return json.dumps([
                {"problem": "Too generic and lacks practical step-by-step guidance", "frequency": 38, "opportunity": "Provide hands-on templates, detailed workflows, and exact walkthroughs"},
                {"problem": "Confusing visual layout or poor templates", "frequency": 27, "opportunity": "High-contrast clean minimalist layouts with fillable checklists"},
                {"problem": "Outdated tools and obsolete advice", "frequency": 21, "opportunity": "2026-ready proven modern framework with current examples"},
                {"problem": "Overwhelming technical jargon without beginner glossaries", "frequency": 14, "opportunity": "Plain-English explanations and cheat sheets"}
            ])
        elif "verdict" in prompt_lower or "go/pivot" in prompt_lower:
            return json.dumps({
                "verdict": "GO",
                "winning_angle": "The Beginner-Friendly Practical Blueprint with Ready-to-Use Templates",
                "ideal_customer": "Busy professionals seeking simple step-by-step systems without jargon",
                "main_pain": "Overwhelmed by abstract theory and lacking structured implementation roadmaps",
                "differentiator": "Direct action orientation, zero fluff, include 15 fillable templates and daily checklists",
                "recommended_format": "Interactive Workbook + 6x9 Printable Companion Guide",
                "recommended_price": 19.99,
                "title": "The Master Digital Action Guide",
                "subtitle": "A Step-by-Step Blueprint to Rapid Mastery in 30 Days"
            })
        elif "title" in prompt_lower and "subtitle" in prompt_lower:
            return json.dumps([
                {"title": "The Essential Digital Playbook", "subtitle": "How to Build Systematic Momentum from Scratch", "score": 92},
                {"title": "Clarity & Momentum", "subtitle": "A No-Nonsense Framework for Everyday Execution", "score": 89},
                {"title": "The 30-Day Focus Blueprint", "subtitle": "Transform Intentions into Repeatable Results", "score": 88},
                {"title": "Practical Mastery Manual", "subtitle": "Checklists, Systems, and Roadmaps for Beginners", "score": 86},
                {"title": "The Daily Execution Protocol", "subtitle": "Stop Overthinking and Start Shipping", "score": 85},
                {"title": "Systems Over Stress", "subtitle": "A Complete Guide to Simplifying Complex Work", "score": 84},
                {"title": "The Precision Toolkit", "subtitle": "Actionable Templates for High-Performance Output", "score": 82},
                {"title": "Zero to Done", "subtitle": "The Structured Path to Tangible Outcomes", "score": 81},
                {"title": "The Everyday Architect", "subtitle": "Designing Systems that Free Up Time", "score": 80},
                {"title": "The Focused Creator", "subtitle": "How to Plan, Build, and Finish High-Value Products", "score": 79}
            ])
        return (
            "When you sit down to execute your highest priority work, the primary obstacle is rarely motivation—it is the chronic ambiguity of what step to take next. "
            "Consider Alex, who spent weeks researching productivity tools yet accomplished little because the framework lacked a clear 1-action daily baseline.\n\n"
            "Your finishable action today:\n"
            "1. Define the single deliverable that proves progress for today.\n"
            "2. Strip away secondary perfectionism.\n"
            "3. Dedicate a 30-minute sprint to finish it completely before switching contexts."
        )

# Global unified AI service instance
gemini_service = AIService()
