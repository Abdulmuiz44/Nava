"""Remote Nava Web API client with run-lifecycle-first execution."""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from task_executor import TaskResult


@dataclass
class WebApiClient:
    base_url: str
    api_key: Optional[str] = None
    timeout_seconds: int = 120

    def __post_init__(self) -> None:
        self.base_url = self.base_url.rstrip("/")

    def execute_task(self, task: str, headless: bool = True) -> TaskResult:
        try:
            run = self._create_run({"task": task, "headless": headless})
            run_id = run["id"]
            started = self._post(f"/api/runs/{run_id}/start", {})
            result = started.get("result")
            if result:
                return self._task_result_from_legacy(result, default_detail=task)

            run_state = self._poll_run_until_terminal(run_id)
            return TaskResult(
                task_type="navigate",
                detail=f"Run {run_id} ended with status {run_state.get('status', 'unknown')}",
                success=run_state.get("status") == "succeeded",
                error_message=run_state.get("error", ""),
                data={"run_id": run_id, "run": run_state},
            )
        except Exception:
            legacy = self._post("/api/execute", {"task": task, "headless": headless})
            result = legacy.get("result") or {}
            return self._task_result_from_legacy(result, default_detail=task)

    def execute_chain(self, tasks: list[str], headless: bool = True) -> list[TaskResult]:
        try:
            run = self._create_run({"tasks": tasks, "headless": headless})
            run_id = run["id"]
            started = self._post(f"/api/runs/{run_id}/start", {})
            results = started.get("results")
            if isinstance(results, list):
                return [self._task_result_from_legacy(entry, default_detail="Task chain step") for entry in results]

            run_state = self._poll_run_until_terminal(run_id)
            return [
                TaskResult(
                    task_type="unknown",
                    detail=f"Run {run_id} ended with status {run_state.get('status', 'unknown')}",
                    success=run_state.get("status") == "succeeded",
                    error_message=run_state.get("error", ""),
                    data={"run_id": run_id, "run": run_state},
                )
            ]
        except Exception:
            legacy = self._post("/api/execute-chain", {"tasks": tasks, "headless": headless})
            raw_results = legacy.get("results") or []
            return [self._task_result_from_legacy(entry, default_detail="Task chain step") for entry in raw_results]

    def _create_run(self, payload: dict[str, Any]) -> dict[str, Any]:
        created = self._post("/api/runs", payload)
        run = created.get("run")
        if not isinstance(run, dict) or "id" not in run:
            raise RuntimeError("Run creation failed: missing run id.")
        return run

    def _poll_run_until_terminal(self, run_id: str) -> dict[str, Any]:
        terminal = {"succeeded", "failed", "cancelled"}
        deadline = time.time() + self.timeout_seconds

        while time.time() < deadline:
            payload = self._get(f"/api/runs/{run_id}")
            run = payload.get("run", {})
            status = run.get("status")
            if status in terminal:
                return run
            time.sleep(1.0)

        raise TimeoutError(f"Timed out waiting for run {run_id}.")

    def _task_result_from_legacy(self, payload: dict[str, Any], default_detail: str) -> TaskResult:
        return TaskResult(
            task_type=payload.get("taskType", "unknown"),
            detail=payload.get("detail", default_detail),
            success=bool(payload.get("success", False)),
            error_message=payload.get("errorMessage", ""),
            data=payload.get("data"),
        )

    def _get(self, path: str) -> dict[str, Any]:
        return self._request("GET", path, None)

    def _post(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", path, body)

    def _request(self, method: str, path: str, body: Optional[dict[str, Any]]) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["x-api-key"] = self.api_key

        request = Request(
            url=url,
            method=method,
            headers=headers,
            data=(json.dumps(body).encode("utf-8") if body is not None else None),
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except HTTPError as exc:
            message = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"HTTP {exc.code} for {method} {url}: {message}") from exc
        except URLError as exc:
            raise RuntimeError(f"Failed to reach {url}: {exc}") from exc
