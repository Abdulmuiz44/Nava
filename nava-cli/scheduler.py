"""Task scheduling and automation."""

from __future__ import annotations

import asyncio
import logging
from typing import Callable, Optional
from datetime import datetime, timedelta

try:
    import schedule
except ImportError:
    schedule = None

logger = logging.getLogger(__name__)


class ScheduleManager:
    """Manage scheduled tasks."""

    def __init__(self):
        self.tasks: dict[str, schedule.Job] = {}
        self.is_running = False

    def schedule_task(
        self,
        task_name: str,
        task_fn: Callable,
        interval: str,
        timeout: float = 300.0,
    ) -> bool:
        """Schedule a task to run at intervals.
        
        Args:
            task_name: Name of the task
            task_fn: Async function to execute
            interval: Schedule interval like:
                "every 5 minutes"
                "every 1 hour"
                "daily at 10:00"
                "every monday at 09:00"
            timeout: Task timeout in seconds
        
        Returns:
            True if scheduled successfully
        """
        if not schedule:
            logger.error("schedule package not installed. Install with: pip install schedule")
            return False

        try:
            job = self._parse_schedule(interval, task_fn)
            if job:
                self.tasks[task_name] = job
                logger.info(f"Scheduled task: {task_name} - {interval}")
                return True
            return False
        except Exception as e:
            logger.error(f"Schedule error: {str(e)}")
            return False

    def _parse_schedule(self, interval: str, task_fn: Callable) -> Optional[schedule.Job]:
        """Parse schedule string and return Job object."""
        interval = interval.lower().strip()

        # Parse "every X minutes/hours/days"
        if interval.startswith("every "):
            parts = interval.replace("every ", "").split()
            if len(parts) >= 2:
                try:
                    amount = int(parts[0])
                    unit = parts[1].lower()

                    if "minute" in unit:
                        return schedule.every(amount).minutes.do(self._run_async, task_fn)
                    elif "hour" in unit:
                        return schedule.every(amount).hours.do(self._run_async, task_fn)
                    elif "day" in unit:
                        return schedule.every(amount).days.do(self._run_async, task_fn)
                except (ValueError, AttributeError):
                    pass

        # Parse "daily at HH:MM"
        if interval.startswith("daily at "):
            time_str = interval.replace("daily at ", "").strip()
            try:
                return schedule.every().day.at(time_str).do(self._run_async, task_fn)
            except:
                pass

        # Parse "every WEEKDAY at HH:MM"
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for day in weekdays:
            if interval.startswith(f"every {day}"):
                time_str = interval.replace(f"every {day} at ", "").strip()
                try:
                    job = getattr(schedule.every(), day).at(time_str).do(self._run_async, task_fn)
                    return job
                except:
                    pass

        return None

    def _run_async(self, task_fn: Callable):
        """Run async function in sync context."""
        try:
            asyncio.run(task_fn())
        except Exception as e:
            logger.error(f"Task execution error: {str(e)}")

    async def start(self):
        """Start scheduler loop."""
        if not schedule:
            logger.error("schedule not installed")
            return

        self.is_running = True
        logger.info(f"Scheduler started with {len(self.tasks)} tasks")

        while self.is_running:
            schedule.run_pending()
            await asyncio.sleep(1)

    def stop(self):
        """Stop scheduler."""
        self.is_running = False
        logger.info("Scheduler stopped")

    def list_tasks(self) -> list[str]:
        """List all scheduled tasks."""
        return list(self.tasks.keys())


class RetryManager:
    """Handle task retries with exponential backoff."""

    def __init__(self, max_retries: int = 3, base_delay: float = 1.0):
        self.max_retries = max_retries
        self.base_delay = base_delay

    async def execute_with_retry(self, task_fn, *args, **kwargs):
        """Execute task with retries and exponential backoff."""
        last_error = None

        for attempt in range(self.max_retries + 1):
            try:
                logger.info(f"Executing task (attempt {attempt + 1}/{self.max_retries + 1})")
                result = await task_fn(*args, **kwargs)
                
                if result and hasattr(result, 'success') and result.success:
                    logger.info("Task succeeded")
                    return result
                elif result:
                    return result

            except Exception as e:
                last_error = e
                logger.warning(f"Task failed: {str(e)}")

                if attempt < self.max_retries:
                    delay = self.base_delay * (2 ** attempt)
                    logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)

        logger.error(f"Task failed after {self.max_retries + 1} attempts")
        if last_error:
            raise last_error

        return None
