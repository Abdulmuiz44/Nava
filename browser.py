"""Abstractions for launching and controlling a Playwright browser session."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Optional

from playwright.async_api import Browser, BrowserContext, Page, async_playwright


@dataclass(slots=True)
class BrowserConfig:
    """Configuration for launching a browser."""

    browser_type: str = "chromium"
    channel: Optional[str] = "chrome"
    headless: bool = False
    viewport_width: int = 1280
    viewport_height: int = 720


class BrowserSession:
    """Async context manager that exposes high-level browser helpers."""

    def __init__(self, config: BrowserConfig | None = None) -> None:
        self._config = config or BrowserConfig()
        self._playwright = None
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None

    async def __aenter__(self) -> "BrowserSession":
        self._playwright = await async_playwright().start()
        launcher = getattr(self._playwright, self._config.browser_type, None)
        if launcher is None:
            raise ValueError(f"Unsupported browser type: {self._config.browser_type}")
        self._browser = await launcher.launch(
            channel=self._config.channel,
            headless=self._config.headless,
        )
        self._context = await self._browser.new_context(
            viewport={
                "width": self._config.viewport_width,
                "height": self._config.viewport_height,
            }
        )
        self._page = await self._context.new_page()
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        await asyncio.gather(
            *(obj.close() for obj in (self._page, self._context, self._browser) if obj),
            return_exceptions=True,
        )
        if self._playwright:
            await self._playwright.stop()

    @property
    def page(self) -> Page:
        if not self._page:
            raise RuntimeError("Browser page not initialized")
        return self._page

    async def goto(self, url: str, wait_until: str = "networkidle") -> None:
        await self.page.goto(url, wait_until=wait_until)

    async def type(self, selector: str, text: str, delay: float = 0) -> None:
        await self.page.wait_for_selector(selector)
        await self.page.fill(selector, "")
        await self.page.type(selector, text, delay=delay)

    async def press(self, selector: str, key: str) -> None:
        await self.page.wait_for_selector(selector)
        await self.page.press(selector, key)

    async def click(self, selector: str) -> None:
        await self.page.wait_for_selector(selector)
        await self.page.click(selector)

    async def screenshot(self, path: str, *, full_page: bool = False) -> None:
        await self.page.screenshot(path=path, full_page=full_page)
