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
    navigation_timeout: float = 30000  # 30 seconds default
    element_timeout: float = 10000     # 10 seconds default
    keep_open: bool = False            # Keep browser open after session ends


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
        # Only close browser if keep_open is False
        if not self._config.keep_open:
            await asyncio.gather(
                *(obj.close() for obj in (self._page, self._context, self._browser) if obj),
                return_exceptions=True,
            )
            if self._playwright:
                await self._playwright.stop()
        else:
            # Keep browser open but properly detach
            print(f"\nBrowser kept open. Close it manually when done.")
            try:
                # Close only the page and context, but not the browser
                if self._page:
                    await self._page.close()
                if self._context:
                    await self._context.close()
                # Disconnect from browser but keep it running
                self._page = None
                self._context = None
                # Stop playwright connection but don't close browser process
                if self._playwright:
                    await self._playwright.stop()
                self._playwright = None
                self._browser = None
            except Exception:
                # Ignore cleanup errors when keeping browser open
                pass

    @property
    def page(self) -> Page:
        if not self._page:
            raise RuntimeError("Browser page not initialized")
        return self._page

    async def goto(self, url: str, wait_until: str = "domcontentloaded", timeout: float = 30000) -> None:
        """Navigate to URL with improved timeout handling."""
        try:
            await self.page.goto(url, wait_until=wait_until, timeout=timeout)
        except Exception as e:
            # Fallback to more lenient wait strategy
            if "networkidle" in str(e) or "timeout" in str(e).lower():
                try:
                    await self.page.goto(url, wait_until="domcontentloaded", timeout=15000)
                except Exception:
                    # Last resort - just navigate and wait manually
                    await self.page.goto(url, wait_until="load", timeout=10000)
                    await self.page.wait_for_timeout(2000)  # Wait 2 seconds for page to settle
            else:
                raise e

    async def type(self, selector: str, text: str, delay: float = 0) -> None:
        """Type text in element with improved selector handling."""
        try:
            # Try multiple selector strategies
            selectors_to_try = [
                selector,  # Original selector
                f"#{selector}",  # ID selector
                f".{selector}",  # Class selector
                f"[name='{selector}']",  # Name attribute
                f"[placeholder*='{selector}']",  # Placeholder
                f"input[type='text'][name*='{selector}']",  # Text input
                f"textarea[name*='{selector}']",  # Textarea
            ]
            
            element_found = False
            for sel in selectors_to_try:
                try:
                    await self.page.wait_for_selector(sel, timeout=self._config.element_timeout)
                    await self.page.fill(sel, "")
                    await self.page.type(sel, text, delay=delay)
                    element_found = True
                    break
                except:
                    continue
            
            if not element_found:
                # Try to find input elements by placeholder or label
                try:
                    elements = await self.page.query_selector_all(f"input:has-text('{selector}')")
                    if not elements:
                        elements = await self.page.query_selector_all(f"*:has-text('{selector}') input")
                    if elements:
                        await elements[0].fill("")
                        await elements[0].type(text, delay=delay)
                        element_found = True
                except:
                    pass
            
            if not element_found:
                raise Exception(f"Input element '{selector}' not found. Tried multiple selector strategies.")
                
        except Exception as e:
            raise Exception(f"Failed to type in '{selector}': {str(e)}")

    async def press(self, selector: str, key: str) -> None:
        """Press key on element with improved selector handling."""
        try:
            # Try multiple selector strategies
            selectors_to_try = [
                selector,  # Original selector
                f"#{selector}",  # ID selector
                f".{selector}",  # Class selector
                f"[name='{selector}']",  # Name attribute
                "body",  # Fallback to body
            ]
            
            element_found = False
            for sel in selectors_to_try:
                try:
                    await self.page.wait_for_selector(sel, timeout=self._config.element_timeout)
                    await self.page.press(sel, key)
                    element_found = True
                    break
                except:
                    continue
            
            if not element_found:
                # Fallback to pressing on the page
                await self.page.press("body", key)
                
        except Exception as e:
            raise Exception(f"Failed to press '{key}' on '{selector}': {str(e)}")

    async def click(self, selector: str) -> None:
        """Click element with improved selector handling."""
        try:
            # Try multiple selector strategies
            selectors_to_try = [
                selector,  # Original selector
                f"#{selector}",  # ID selector
                f".{selector}",  # Class selector
                f"[name='{selector}']",  # Name attribute
                f"button[contains(text(), '{selector}')]",  # Button text
                f"a[contains(text(), '{selector}')]",  # Link text
                f"input[type='submit'][value*='{selector}']",  # Submit button value
                f"*[contains(text(), '{selector}')]",  # Any element with text
            ]
            
            element_found = False
            for sel in selectors_to_try:
                try:
                    await self.page.wait_for_selector(sel, timeout=self._config.element_timeout)
                    await self.page.click(sel)
                    element_found = True
                    break
                except:
                    continue
            
            if not element_found:
                # Try to find elements containing the selector text
                try:
                    elements = await self.page.query_selector_all(f"*:has-text('{selector}')")
                    if elements:
                        await elements[0].click()
                        element_found = True
                except:
                    pass
            
            if not element_found:
                raise Exception(f"Element '{selector}' not found. Tried multiple selector strategies.")
                
        except Exception as e:
            raise Exception(f"Failed to click '{selector}': {str(e)}")

    async def get_element_suggestions(self, partial_selector: str) -> list[str]:
        """Get suggestions for elements matching partial selector."""
        suggestions = []
        try:
            # Try to find elements with similar text
            elements_with_text = await self.page.query_selector_all(f"*:has-text('{partial_selector}')")
            for element in elements_with_text[:5]:  # Limit to 5 suggestions
                text = await element.text_content()
                if text and text.strip():
                    suggestions.append(f"Text: {text.strip()[:50]}")
            
            # Try to find buttons
            buttons = await self.page.query_selector_all("button")
            for button in buttons[:5]:
                text = await button.text_content()
                if text and partial_selector.lower() in text.lower():
                    suggestions.append(f"Button: {text.strip()[:50]}")
            
            # Try to find links
            links = await self.page.query_selector_all("a[href]")
            for link in links[:5]:
                text = await link.text_content()
                if text and partial_selector.lower() in text.lower():
                    suggestions.append(f"Link: {text.strip()[:50]}")
                    
        except Exception:
            pass
        
        return suggestions

    async def screenshot(self, path: str, *, full_page: bool = False) -> None:
        await self.page.screenshot(path=path, full_page=full_page)
