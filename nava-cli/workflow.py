"""Workflow handling for YAML/JSON configuration files."""

from __future__ import annotations

import json
import yaml
import logging
from pathlib import Path
from typing import Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class WorkflowConfig:
    """Configuration for a workflow."""

    name: str
    description: str = ""
    browser: str = "chrome"
    headless: bool = False
    timeout: float = 30.0
    retries: int = 1
    screenshot: Optional[str] = None
    video: Optional[str] = None
    tasks: list[str] | list[dict[str, Any]] = None
    variables: dict[str, str] = None
    webhook: Optional[str] = None
    db_connection: Optional[str] = None
    s3_bucket: Optional[str] = None

    def __post_init__(self):
        if self.tasks is None:
            self.tasks = []
        if self.variables is None:
            self.variables = {}


def load_workflow(path: str | Path) -> WorkflowConfig:
    """Load workflow from YAML or JSON file."""
    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(f"Workflow file not found: {path}")

    with open(path, "r") as f:
        if path.suffix in [".yaml", ".yml"]:
            data = yaml.safe_load(f)
        elif path.suffix == ".json":
            data = json.load(f)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")

    return WorkflowConfig(**data)


def save_workflow(config: WorkflowConfig, path: str | Path, format: str = "yaml"):
    """Save workflow to YAML or JSON file."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    data = {
        "name": config.name,
        "description": config.description,
        "browser": config.browser,
        "headless": config.headless,
        "timeout": config.timeout,
        "retries": config.retries,
        "tasks": config.tasks,
    }

    if config.screenshot:
        data["screenshot"] = config.screenshot
    if config.video:
        data["video"] = config.video
    if config.variables:
        data["variables"] = config.variables
    if config.webhook:
        data["webhook"] = config.webhook
    if config.db_connection:
        data["db_connection"] = config.db_connection
    if config.s3_bucket:
        data["s3_bucket"] = config.s3_bucket

    with open(path, "w") as f:
        if format in ["yaml", "yml"]:
            yaml.dump(data, f, default_flow_style=False)
        elif format == "json":
            json.dump(data, f, indent=2)
        else:
            raise ValueError(f"Unsupported format: {format}")

    logger.info(f"Workflow saved to {path}")


def expand_variables(text: str, variables: dict[str, str]) -> str:
    """Expand variables in text using {var_name} syntax."""
    for key, value in variables.items():
        text = text.replace(f"{{{key}}}", value)
    return text


def parse_task_string(task_str: str) -> dict[str, Any]:
    """Parse a task string into an action dictionary."""
    # Simple parser for natural language tasks
    task_str = task_str.strip()

    # Extract action type and parameters
    if task_str.lower().startswith("go to"):
        return {
            "action": "navigate",
            "url": task_str.replace("go to", "").strip(),
        }
    elif task_str.lower().startswith("search"):
        return {
            "action": "search",
            "query": task_str.replace("search for", "").replace("search", "").strip(),
        }
    elif task_str.lower().startswith("click"):
        return {
            "action": "click",
            "selector": task_str.replace("click", "").replace("on", "").strip(),
        }
    elif "fill" in task_str.lower() and "with" in task_str.lower():
        parts = task_str.lower().split(" with ")
        selector = parts[0].replace("fill", "").strip()
        value = parts[1].strip() if len(parts) > 1 else ""
        return {"action": "fill", "selector": selector, "value": value}
    elif task_str.lower().startswith("type"):
        parts = task_str.lower().split(" in ")
        text = parts[0].replace("type", "").strip()
        selector = parts[1].strip() if len(parts) > 1 else ""
        return {"action": "type", "selector": selector, "text": text}
    elif task_str.lower().startswith("wait"):
        return {
            "action": "wait",
            "selector": task_str.replace("wait for", "").replace("wait", "").strip(),
        }
    elif "screenshot" in task_str.lower():
        path = task_str.replace("take screenshot", "").replace("screenshot", "").strip()
        return {"action": "screenshot", "path": path or "screenshot.png"}
    elif "extract" in task_str.lower():
        return {"action": "extract", "query": task_str}
    else:
        return {"action": "unknown", "text": task_str}
