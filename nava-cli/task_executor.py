"""Enhanced task parsing and execution with support for all actions."""

from __future__ import annotations

import re
import json
import logging
from dataclasses import dataclass, field
from typing import Literal, Any, Optional
from urllib.parse import quote_plus

from browser import BrowserSession

TaskType = Literal[
    "navigate",
    "search",
    "extract",
    "click",
    "fill",
    "type",
    "press",
    "wait",
    "screenshot",
    "execute_js",
    "unknown",
]


@dataclass(slots=True)
class TaskResult:
    """Structured result describing what action was performed."""

    task_type: TaskType
    detail: str
    success: bool
    error_message: str = ""
    data: dict[str, Any] | None = None


@dataclass
class ActionConfig:
    """Configuration for a single action."""

    action: str
    selector: str = ""
    value: str = ""
    text: str = ""
    url: str = ""
    key: str = ""
    timeout: float = 5.0
    condition: str = ""
    script: str = ""
    delay: float = 0.0

    @classmethod
    def from_dict(cls, data: dict) -> ActionConfig:
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


# Regex patterns for natural language commands
_GO_TO_PATTERN = re.compile(r"^\s*go\s+to\s+(?P<target>.+)$", re.IGNORECASE)
_SEARCH_PATTERN = re.compile(r"^\s*search\s+(?:for\s+)?(?P<term>.+)$", re.IGNORECASE)
_EXTRACT_PATTERN = re.compile(
    r"^\s*extract\s+(?P<items>.+?)\s+from\s+(?P<url>.+)$", re.IGNORECASE
)
_CLICK_PATTERN = re.compile(r"^\s*click\s+(?:on\s+)?['\"]?(?P<selector>.+?)['\"]?$", re.IGNORECASE)
_FILL_PATTERN = re.compile(
    r"^\s*fill\s+(?P<selector>.+?)\s+with\s+(?P<value>.+)$", re.IGNORECASE
)
_TYPE_PATTERN = re.compile(
    r"^\s*type\s+['\"]?(?P<text>.+?)['\"]?\s+(?:in|into)\s+(?P<selector>.+)$", re.IGNORECASE
)
_PRESS_PATTERN = re.compile(r"^\s*press\s+(?P<key>\w+)$", re.IGNORECASE)
_WAIT_PATTERN = re.compile(
    r"^\s*wait\s+(?:for\s+)?['\"]?(?P<selector>.+?)['\"]?(?:\s+to\s+(?P<condition>\w+))?$",
    re.IGNORECASE,
)
_SCREENSHOT_PATTERN = re.compile(r"^\s*(?:take\s+)?screenshot(?:\s+(?P<path>.+))?$", re.IGNORECASE)
_EXECUTE_PATTERN = re.compile(r"^\s*execute\s+(?P<script>.+)$", re.IGNORECASE)
_IF_PATTERN = re.compile(
    r"^\s*if\s+['\"]?(?P<condition>.+?)['\"]?\s+(?:exists|is present)\s+then\s+(?P<then>.+?)(?:\s+else\s+(?P<else>.+))?$",
    re.IGNORECASE,
)

logger = logging.getLogger(__name__)


async def execute_task(prompt: str, session: BrowserSession) -> TaskResult:
    """Interpret *prompt* and perform the requested action using *session*."""

    stripped = prompt.strip()
    if not stripped:
        error_msg = "Prompt must not be empty."
        logger.error(error_msg)
        return TaskResult(
            task_type="unknown", detail="", success=False, error_message=error_msg
        )

    try:
        # Check for conditional logic
        if_match = _IF_PATTERN.match(stripped)
        if if_match:
            condition = if_match.group("condition").strip()
            then_action = if_match.group("then").strip()
            else_action = if_match.group("else")
            
            try:
                exists = await session.page.query_selector(condition) is not None
            except:
                exists = False
            
            action_to_execute = then_action if exists else (else_action or "")
            if action_to_execute:
                return await execute_task(action_to_execute, session)
            return TaskResult(
                task_type="unknown",
                detail=f"Condition {'true' if exists else 'false'}, no action executed",
                success=True,
            )

        # Try extraction pattern
        extract_match = _EXTRACT_PATTERN.match(stripped)
        if extract_match:
            items = extract_match.group("items").strip()
            url = extract_match.group("url").strip()
            url = _ensure_url(url)
            logger.info(f"Extracting '{items}' from: {url}")
            await session.goto(url)
            data = await _extract_data(session, items)
            return TaskResult(
                task_type="extract",
                detail=f"Extracted {data.get('count', 0)} items: {items}",
                success=True,
                data=data,
            )

        # Try click pattern
        click_match = _CLICK_PATTERN.match(stripped)
        if click_match:
            selector = click_match.group("selector").strip()
            logger.info(f"Clicking: {selector}")
            await session.click(selector)
            return TaskResult(task_type="click", detail=selector, success=True)

        # Try fill pattern
        fill_match = _FILL_PATTERN.match(stripped)
        if fill_match:
            selector = fill_match.group("selector").strip()
            value = fill_match.group("value").strip()
            logger.info(f"Filling {selector} with {value}")
            await session.type(selector, value)
            return TaskResult(task_type="fill", detail=f"{selector} = {value}", success=True)

        # Try type pattern
        type_match = _TYPE_PATTERN.match(stripped)
        if type_match:
            text = type_match.group("text").strip()
            selector = type_match.group("selector").strip()
            logger.info(f"Typing '{text}' in {selector}")
            await session.type(selector, text)
            return TaskResult(task_type="type", detail=f"Typed in {selector}", success=True)

        # Try press pattern
        press_match = _PRESS_PATTERN.match(stripped)
        if press_match:
            key = press_match.group("key").strip()
            logger.info(f"Pressing: {key}")
            await session.press("body", key)
            return TaskResult(task_type="press", detail=f"Pressed {key}", success=True)

        # Try wait pattern
        wait_match = _WAIT_PATTERN.match(stripped)
        if wait_match:
            selector = wait_match.group("selector").strip()
            condition = wait_match.group("condition")
            logger.info(f"Waiting for: {selector}")
            
            if condition and "disappear" in condition.lower():
                await session.page.wait_for_selector(selector, state="hidden")
            else:
                await session.page.wait_for_selector(selector)
            
            return TaskResult(task_type="wait", detail=f"Waited for {selector}", success=True)

        # Try screenshot pattern
        screenshot_match = _SCREENSHOT_PATTERN.match(stripped)
        if screenshot_match:
            path = screenshot_match.group("path")
            path = path.strip() if path else "screenshot.png"
            logger.info(f"Taking screenshot: {path}")
            await session.screenshot(path)
            return TaskResult(task_type="screenshot", detail=path, success=True)

        # Try execution pattern
        execute_match = _EXECUTE_PATTERN.match(stripped)
        if execute_match:
            script = execute_match.group("script").strip()
            logger.info(f"Executing script")
            result = await session.page.evaluate(script)
            return TaskResult(
                task_type="execute_js",
                detail="Script executed",
                success=True,
                data={"result": result},
            )

        # Try navigation pattern
        go_match = _GO_TO_PATTERN.match(stripped)
        if go_match:
            target = _ensure_url(go_match.group("target").strip())
            logger.info(f"Navigating to: {target}")
            await session.goto(target)
            return TaskResult(task_type="navigate", detail=target, success=True)

        # Try search pattern or default to search
        search_match = _SEARCH_PATTERN.match(stripped)
        query = search_match.group("term").strip() if search_match else stripped
        search_url = _build_google_search_url(query)
        logger.info(f"Performing search for: {query}")
        await session.goto(search_url)
        return TaskResult(task_type="search", detail=query, success=True)

    except Exception as e:
        error_msg = f"Failed to execute task: {str(e)}"
        logger.error(error_msg)
        return TaskResult(
            task_type="unknown",
            detail=stripped,
            success=False,
            error_message=error_msg,
        )


async def execute_task_chain(
    tasks: list[str], session: BrowserSession, continue_on_error: bool = False
) -> list[TaskResult]:
    """Execute multiple tasks in sequence."""
    results = []
    for task in tasks:
        if task.strip():
            result = await execute_task(task.strip(), session)
            results.append(result)
            if not result.success and not continue_on_error:
                logger.warning(f"Task failed, stopping: {result.error_message}")
                break
            elif not result.success:
                logger.warning(f"Task failed, continuing: {result.error_message}")
    return results


async def _extract_data(session: BrowserSession, query: str) -> dict[str, Any]:
    """Extract data from the current page based on query."""
    page = session.page
    data = {"query": query, "results": []}

    try:
        if "link" in query.lower():
            results = await page.evaluate(
                """() => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => ({text: a.textContent.trim(), href: a.href}))
                    .filter(a => a.text.length > 0)
                    .slice(0, 50);
            }"""
            )
            data["results"] = results
            data["count"] = len(results)

        elif "heading" in query.lower():
            results = await page.evaluate(
                """() => {
                return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                    .map(h => ({level: h.tagName, text: h.textContent.trim()}))
                    .filter(h => h.text.length > 0)
                    .slice(0, 50);
            }"""
            )
            data["results"] = results
            data["count"] = len(results)

        elif "image" in query.lower():
            results = await page.evaluate(
                """() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => ({src: img.src, alt: img.alt}))
                    .filter(img => img.src)
                    .slice(0, 50);
            }"""
            )
            data["results"] = results
            data["count"] = len(results)

        elif "button" in query.lower():
            results = await page.evaluate(
                """() => {
                return Array.from(document.querySelectorAll('button, [role="button"]'))
                    .map(btn => ({text: btn.textContent.trim()}))
                    .filter(btn => btn.text.length > 0)
                    .slice(0, 50);
            }"""
            )
            data["results"] = results
            data["count"] = len(results)

        elif "table" in query.lower():
            results = await page.evaluate(
                """() => {
                return Array.from(document.querySelectorAll('table'))
                    .map((table, idx) => ({
                        index: idx,
                        rows: Array.from(table.querySelectorAll('tr'))
                            .map(row => Array.from(row.querySelectorAll('td, th'))
                                .map(cell => cell.textContent.trim()))
                            .slice(0, 20)
                    }));
            }"""
            )
            data["results"] = results
            data["count"] = len(results)

        elif "text" in query.lower():
            results = await page.evaluate(
                """() => {
                return document.body.innerText
                    .split('\\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .slice(0, 50);
            }"""
            )
            data["results"] = results
            data["count"] = len(results)

        else:
            results = await page.evaluate(
                """() => {
                return Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
                    .map(el => el.textContent.trim())
                    .filter(text => text.length > 0)
                    .slice(0, 50);
            }"""
            )
            data["results"] = results
            data["count"] = len(results)

    except Exception as e:
        logger.error(f"Data extraction error: {str(e)}")
        data["error"] = str(e)

    return data


def _ensure_url(raw: str) -> str:
    """Ensure the raw string is a valid URL with protocol."""
    if re.match(r"^[a-z]+://", raw, flags=re.IGNORECASE):
        return raw
    if raw.startswith("localhost") or raw.startswith("127.0.0.1"):
        return f"http://{raw}"
    return f"https://{raw}"


def _build_google_search_url(query: str) -> str:
    """Build a Google search URL for the given query."""
    encoded_query = quote_plus(query)
    return f"https://www.google.com/search?q={encoded_query}&hl=en"
