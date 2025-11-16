"""High-level browser automation interface using the standardized browser module."""

import asyncio
from typing import Optional

from browser import BrowserConfig, BrowserSession


class BrowserUse:
    """Legacy compatibility wrapper around BrowserSession."""
    
    def __init__(self, browser_type: str = "chromium", headless: bool = False) -> None:
        # Map old browser_type parameter to new config
        channel = "chrome" if browser_type == "chromium" else None
        self.config = BrowserConfig(
            browser_type=browser_type if browser_type != "chromium" else "chromium",
            channel=channel,
            headless=headless
        )
        self.session: Optional[BrowserSession] = None

    async def __aenter__(self) -> "BrowserUse":
        self.session = BrowserSession(self.config)
        await self.session.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        if self.session:
            await self.session.__aexit__(exc_type, exc, tb)

    async def goto(self, url: str, wait_until: str = "networkidle") -> None:
        if not self.session:
            raise RuntimeError("Browser session not initialized")
        await self.session.goto(url, wait_until)

    async def type(self, selector: str, text: str, delay: float = 0) -> None:
        if not self.session:
            raise RuntimeError("Browser session not initialized")
        await self.session.type(selector, text, delay)

    async def press(self, selector: str, key: str) -> None:
        if not self.session:
            raise RuntimeError("Browser session not initialized")
        await self.session.press(selector, key)

    async def screenshot(self, path: str, *, full_page: bool = False) -> None:
        if not self.session:
            raise RuntimeError("Browser session not initialized")
        await self.session.screenshot(path, full_page=full_page)
