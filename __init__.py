"""Browser automation package for the Nava project."""

from .browser import BrowserSession, BrowserConfig
from .task_executor import execute_task, TaskResult

__all__ = [
    "BrowserConfig",
    "BrowserSession",
    "TaskResult",
    "execute_task",
]
