import asyncio
import random
import time
import uuid
import logging
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
from patchright.async_api import async_playwright, Browser, BrowserContext, Page
from app.config import EVIDENCE_DIR, MIN_ACTION_DELAY_SEC, MAX_ACTION_DELAY_SEC

logger = logging.getLogger("browser_engine")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
]

class BrowserEngine:
    _instance = None
    _playwright = None
    _browser: Optional[Browser] = None
    _active_sessions: Dict[str, Dict[str, Any]] = {}

    @classmethod
    async def get_instance(cls):
        if cls._instance is None:
            cls._instance = BrowserEngine()
            await cls._instance.start()
        return cls._instance

    async def start(self):
        if not self._playwright:
            self._playwright = await async_playwright().start()
            launch_args = [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-infobars"
            ]
            try:
                # Prioritize local Chrome channel for stealth and zero CDN dependencies
                self._browser = await self._playwright.chromium.launch(
                    channel="chrome",
                    headless=True,
                    args=launch_args
                )
                logger.info("Patchright Chrome (local channel) started successfully.")
            except Exception as e:
                logger.warning(f"Local Chrome channel launch failed, trying bundled chromium: {e}")
                self._browser = await self._playwright.chromium.launch(
                    headless=True,
                    args=launch_args
                )
                logger.info("Patchright bundled Chromium started.")

    async def close(self):
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None

    async def create_context(self, user_agent: Optional[str] = None) -> BrowserContext:
        await self.start()
        ua = user_agent or random.choice(USER_AGENTS)
        context = await self._browser.new_context(
            user_agent=ua,
            viewport={"width": 1440, "height": 900},
            locale="en-US",
            timezone_id="America/New_York"
        )
        return context

    async def sleep_realistic(self):
        delay = random.uniform(MIN_ACTION_DELAY_SEC, MAX_ACTION_DELAY_SEC)
        await asyncio.sleep(delay)

    async def check_captcha(self, page: Page) -> bool:
        """Detect common CAPTCHA patterns on Amazon / Cloudflare / etc."""
        try:
            content = (await page.content()).lower()
            url = page.url.lower()
            captcha_indicators = [
                "robot check", "enter the characters you see below",
                "type the characters you see in this image", "captcha",
                "cf-challenge", "challenge-running", "turnstile",
                "verify you are human", "access denied"
            ]
            for indicator in captcha_indicators:
                if indicator in content or indicator in url:
                    logger.warning(f"CAPTCHA indicator detected: {indicator} on {url}")
                    return True
        except Exception as e:
            logger.debug(f"Error checking captcha: {e}")
        return False

    async def safe_navigate(self, page: Page, url: str, max_retries: int = 2) -> Tuple[bool, Optional[str]]:
        """Navigates to URL with realistic delays, retries and CAPTCHA detection."""
        for attempt in range(max_retries + 1):
            try:
                await self.sleep_realistic()
                response = await page.goto(url, wait_until="domcontentloaded", timeout=25000)
                await asyncio.sleep(1.0)
                
                is_captcha = await self.check_captcha(page)
                if is_captcha:
                    return False, "CAPTCHA_DETECTED"
                
                if response and response.status >= 400:
                    logger.warning(f"HTTP {response.status} when navigating to {url}")
                    if attempt < max_retries:
                        await asyncio.sleep(2.0 * (attempt + 1))
                        continue
                    return False, f"HTTP_{response.status}"
                
                return True, None
            except Exception as e:
                logger.warning(f"Navigate attempt {attempt+1} failed for {url}: {e}")
                if attempt < max_retries:
                    await asyncio.sleep(2.0 * (attempt + 1))
                else:
                    return False, str(e)
        return False, "TIMEOUT"

    async def capture_screenshot(self, page: Page, platform: str, session_id: str, label: str = "evidence") -> str:
        """Captures and stores screenshot in Evidence Vault."""
        try:
            folder = EVIDENCE_DIR / platform / session_id
            folder.mkdir(parents=True, exist_ok=True)
            timestamp = int(time.time())
            filename = f"{label}_{timestamp}_{uuid.uuid4().hex[:6]}.png"
            filepath = folder / filename
            await page.screenshot(path=str(filepath), full_page=False)
            rel_path = f"evidence/{platform}/{session_id}/{filename}"
            return rel_path
        except Exception as e:
            logger.error(f"Failed to capture screenshot: {e}")
            return ""

browser_engine = BrowserEngine()
