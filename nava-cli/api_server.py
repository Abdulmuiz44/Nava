"""FastAPI server for remote task execution."""

from __future__ import annotations

import asyncio
import logging
import json
from typing import Optional, Any
from datetime import datetime
from uuid import uuid4

try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    import uvicorn
except ImportError:
    FastAPI = None
    BaseModel = None
    uvicorn = None

from browser import BrowserConfig, BrowserSession
from task_executor import execute_task, execute_task_chain
from integrations import IntegrationManager

logger = logging.getLogger(__name__)


class TaskRequest(BaseModel):
    """Request model for single task."""

    task: str
    browser: str = "chrome"
    headless: bool = False
    timeout: float = 30.0
    screenshot: Optional[str] = None
    use_browser_use: bool = False
    mobile: bool = False


class ChainRequest(BaseModel):
    """Request model for task chain."""

    tasks: list[str]
    browser: str = "chrome"
    headless: bool = False
    continue_on_error: bool = False
    timeout: float = 30.0
    use_browser_use: bool = False
    mobile: bool = False


class TaskResponse(BaseModel):
    """Response model for task execution."""

    id: str
    success: bool
    task_type: str
    detail: str
    error_message: str = ""
    data: Optional[dict[str, Any]] = None
    timestamp: str


class APIServer:
    """REST API server for browser automation."""

    def __init__(self, host: str = "0.0.0.0", port: int = 8000):
        if not FastAPI:
            raise ImportError("FastAPI not installed. Install with: pip install fastapi uvicorn")

        self.host = host
        self.port = port
        self.app = FastAPI(
            title="Nava API",
            description="Remote browser automation API",
            version="1.0.0",
        )
        self.integrations = IntegrationManager()
        self._setup_routes()

    def _setup_routes(self):
        """Setup API routes."""

        @self.app.get("/health")
        async def health():
            return {"status": "healthy", "service": "Nava API"}

        @self.app.post("/execute", response_model=TaskResponse)
        async def execute_task_endpoint(request: TaskRequest):
            """Execute a single task."""
            return await self._execute_task(request)

        @self.app.post("/execute-chain", response_model=list[TaskResponse])
        async def execute_chain_endpoint(request: ChainRequest):
            """Execute a chain of tasks."""
            return await self._execute_chain(request)

        @self.app.get("/status/{task_id}")
        async def get_status(task_id: str):
            """Get task status (for async tracking)."""
            return {
                "task_id": task_id,
                "status": "completed",  # In production, track actual status
                "message": "Task completed successfully",
            }

        @self.app.post("/schedule")
        async def schedule_task(request: dict):
            """Schedule a task to run periodically."""
            # Implementation would integrate with scheduler module
            return {
                "scheduled": True,
                "task_name": request.get("name"),
                "interval": request.get("interval"),
            }

    async def _execute_task(self, request: TaskRequest) -> TaskResponse:
        """Execute a single task and return response."""
        task_id = str(uuid4())
        timestamp = datetime.utcnow().isoformat()

        try:
            # Try Browser Use first if enabled
            if request.use_browser_use:
                from task_executor import execute_task_with_browser_use
                
                browser_use_result = await execute_task_with_browser_use(
                    prompt=request.task,
                    use_browser_use=True,
                    mobile=request.mobile,
                    headless=request.headless,
                )
                
                if browser_use_result and browser_use_result.get("success"):
                    return TaskResponse(
                        id=task_id,
                        success=True,
                        task_type="browser_use",
                        detail=browser_use_result.get("result", "Task completed"),
                        data={
                            "history": browser_use_result.get("history", []),
                            "screenshots": browser_use_result.get("screenshots", []),
                        },
                        timestamp=timestamp,
                    )
            
            # Fallback to Playwright
            config = BrowserConfig(
                browser_type="chromium" if request.browser == "chrome" else request.browser,
                channel=request.browser if request.browser == "chrome" else None,
                headless=request.headless,
                emulate_mobile=request.mobile,
            )

            async with BrowserSession(config) as session:
                result = await execute_task(request.task, session)

                if request.screenshot:
                    await session.screenshot(request.screenshot)

                response = TaskResponse(
                    id=task_id,
                    success=result.success,
                    task_type=result.task_type,
                    detail=result.detail,
                    error_message=result.error_message,
                    data=result.data,
                    timestamp=timestamp,
                )

                # Send to integrations
                await self.integrations.send_results(response.dict())

                return response

        except Exception as e:
            logger.error(f"Task execution error: {str(e)}")
            return TaskResponse(
                id=task_id,
                success=False,
                task_type="unknown",
                detail="",
                error_message=str(e),
                timestamp=timestamp,
            )

    async def _execute_chain(self, request: ChainRequest) -> list[TaskResponse]:
        """Execute a chain of tasks."""
        responses = []

        try:
            config = BrowserConfig(
                browser_type="chromium" if request.browser == "chrome" else request.browser,
                channel=request.browser if request.browser == "chrome" else None,
                headless=request.headless,
            )

            async with BrowserSession(config) as session:
                results = await execute_task_chain(
                    request.tasks, session, request.continue_on_error
                )

                for result in results:
                    response = TaskResponse(
                        id=str(uuid4()),
                        success=result.success,
                        task_type=result.task_type,
                        detail=result.detail,
                        error_message=result.error_message,
                        data=result.data,
                        timestamp=datetime.utcnow().isoformat(),
                    )
                    responses.append(response)

                    # Send to integrations
                    await self.integrations.send_results(response.dict())

                return responses

        except Exception as e:
            logger.error(f"Chain execution error: {str(e)}")
            return [
                TaskResponse(
                    id=str(uuid4()),
                    success=False,
                    task_type="unknown",
                    detail="",
                    error_message=str(e),
                    timestamp=datetime.utcnow().isoformat(),
                )
            ]

    def run(self):
        """Start the API server."""
        logger.info(f"Starting API server on {self.host}:{self.port}")
        uvicorn.run(self.app, host=self.host, port=self.port, log_level="info")


def create_server(host: str = "0.0.0.0", port: int = 8000) -> APIServer:
    """Create and return API server instance."""
    return APIServer(host, port)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    server = create_server()
    server.run()
