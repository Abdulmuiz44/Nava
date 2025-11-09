"""Main browsing agent class that orchestrates browser automation tasks."""

import asyncio
import logging
from typing import Optional

from browser import BrowserConfig, BrowserSession
from task_executor import execute_task, TaskResult


class BrowsingAgent:
    """High-level interface for browser automation tasks."""
    
    def __init__(self, config: Optional[BrowserConfig] = None):
        self.config = config or BrowserConfig()
        self.logger = logging.getLogger(__name__)
    
    async def execute_task(self, prompt: str) -> TaskResult:
        """Execute a browser task based on a natural language prompt."""
        self.logger.info(f"Executing task: {prompt}")
        
        async with BrowserSession(self.config) as session:
            result = await execute_task(prompt, session)
            self.logger.info(f"Task completed: {result.task_type} - {result.detail}")
            return result
    
    async def execute_with_screenshot(self, prompt: str, screenshot_path: str) -> TaskResult:
        """Execute a task and save a screenshot of the result."""
        async with BrowserSession(self.config) as session:
            result = await execute_task(prompt, session)
            await session.screenshot(screenshot_path, full_page=True)
            self.logger.info(f"Screenshot saved to {screenshot_path}")
            return result


def main() -> int:
    """Entry point for running the browsing agent."""
    import sys
    from cli import main as cli_main
    return cli_main(sys.argv[1:])


if __name__ == "__main__":
    raise SystemExit(main())
