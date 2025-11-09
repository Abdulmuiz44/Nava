"""Advanced CLI with all features integrated."""

from __future__ import annotations

import argparse
import asyncio
import sys
import json
from pathlib import Path
from typing import Mapping, Optional, Sequence

from browser import BrowserConfig, BrowserSession
from task_executor import execute_task, execute_task_chain
from workflow import load_workflow, save_workflow, expand_variables, WorkflowConfig
from integrations import IntegrationManager
from scheduler import ScheduleManager, RetryManager

_BROWSER_MAP: Mapping[str, tuple[str, Optional[str]]] = {
    "chrome": ("chromium", "chrome"),
    "chromium": ("chromium", None),
    "firefox": ("firefox", None),
    "webkit": ("webkit", None),
}


class Colors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"


def _colorize(text: str, color: str) -> str:
    if sys.stdout.isatty():
        return f"{color}{text}{Colors.RESET}"
    return text


def _success(text: str) -> str:
    return _colorize(f"✓ {text}", Colors.GREEN)


def _error(text: str) -> str:
    return _colorize(f"✗ {text}", Colors.RED)


def _info(text: str) -> str:
    return _colorize(f"ℹ {text}", Colors.BLUE)


def _warn(text: str) -> str:
    return _colorize(f"⚠ {text}", Colors.YELLOW)


def _highlight(text: str) -> str:
    return _colorize(text, Colors.BOLD)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=_highlight("🌐 Browsing Agent Pro - Advanced Browser Automation"),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
EXAMPLES:
  # Single task
  %(prog)s "go to github.com"
  
  # Task chaining
  %(prog)s "go to github.com, search python, take screenshot"
  
  # Data extraction
  %(prog)s "extract all links from https://github.com" --json links.json
  
  # Interact with elements
  %(prog)s "go to google.com, fill input[name=q] with python, press Enter"
  
  # Conditional logic
  %(prog)s "go to site.com, if '.premium' exists then click 'Upgrade'"
  
  # With retries
  %(prog)s "go to site.com" --retries 3
  
  # Load workflow
  %(prog)s --load workflow.yaml
  
  # Save workflow
  %(prog)s "go to github.com" --save login.yaml
  
  # API mode
  %(prog)s --api --port 8000
  
  # Schedule task
  %(prog)s "extract links from site.com" --schedule "every 5 minutes" --slack slack-webhook
  
  # Interactive mode
  %(prog)s -i
        """,
    )

    # Basic options
    parser.add_argument("prompt", nargs="?", help="Task or comma-separated tasks")
    parser.add_argument("--browser", default="chrome", choices=_BROWSER_MAP.keys(), help="Browser engine")
    parser.add_argument("--headless", action="store_true", help="Run headless")
    parser.add_argument("-i", "--interactive", action="store_true", help="Interactive mode")

    # Workflow options
    parser.add_argument("--load", type=Path, help="Load workflow from YAML/JSON")
    parser.add_argument("--save", type=Path, help="Save workflow to YAML file")
    parser.add_argument("--vars", type=str, help="Variables (key=value,key=value)")

    # Output options
    parser.add_argument("--json", type=Path, dest="json_output", help="Save results as JSON")
    parser.add_argument("--screenshot", type=Path, help="Save screenshot")
    parser.add_argument("--video", type=Path, help="Record video")

    # Advanced options
    parser.add_argument("--timeout", type=float, default=30.0, help="Task timeout (seconds)")
    parser.add_argument("--retries", type=int, default=1, help="Retry failed tasks")
    parser.add_argument("--continue-on-error", action="store_true", help="Continue on failure")
    parser.add_argument("--parallel", type=int, default=1, help="Parallel tasks (1-4)")

    # Integration options
    parser.add_argument("--webhook", type=str, help="Webhook URL for results")
    parser.add_argument("--slack", type=str, help="Slack webhook URL")
    parser.add_argument("--db", type=str, help="Database connection string")
    parser.add_argument("--s3", type=str, help="S3 bucket name")

    # Scheduler options
    parser.add_argument("--schedule", type=str, help="Schedule interval (e.g., 'every 5 minutes')")
    parser.add_argument("--verbose", action="store_true", help="Verbose logging")
    parser.add_argument("--debug-log", type=Path, help="Debug log file")

    # API server
    parser.add_argument("--api", action="store_true", help="Start API server")
    parser.add_argument("--port", type=int, default=8000, help="API port")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="API host")

    return parser


def _config_from_choice(choice: str, *, headless: bool) -> BrowserConfig:
    browser_type, channel = _BROWSER_MAP[choice]
    return BrowserConfig(browser_type=browser_type, channel=channel, headless=headless)


def _parse_task_chain(prompt: str) -> list[str]:
    """Parse comma-separated tasks."""
    tasks = []
    current = ""
    in_url = False

    for i, char in enumerate(prompt):
        if char == "/" and i > 0 and prompt[i - 1] == ":":
            in_url = True
        elif char == " " and in_url and i + 1 < len(prompt) and prompt[i + 1] != " ":
            if "http" in current:
                in_url = False

        if char == "," and not in_url:
            if current.strip():
                tasks.append(current.strip())
            current = ""
        else:
            current += char

    if current.strip():
        tasks.append(current.strip())

    return tasks


async def _run_tasks(
    tasks: list[str],
    config: BrowserConfig,
    integrations: IntegrationManager,
    variables: dict = None,
    continue_on_error: bool = False,
    screenshot: Optional[Path] = None,
    video: Optional[Path] = None,
    json_output: Optional[Path] = None,
    retries: int = 1,
) -> bool:
    """Execute tasks with all features."""
    if variables is None:
        variables = {}

    # Expand variables in tasks
    expanded_tasks = [expand_variables(t, variables) for t in tasks]

    print(_info(f"Executing {len(expanded_tasks)} task(s)"))

    retry_manager = RetryManager(max_retries=retries - 1)
    results = []

    try:
        async with BrowserSession(config) as session:
            for i, task in enumerate(expanded_tasks, 1):
                print(_info(f"[{i}/{len(expanded_tasks)}] {task}"))

                async def execute_wrapper():
                    return await execute_task(task, session)

                result = await retry_manager.execute_with_retry(execute_wrapper)

                if result:
                    results.append(result)
                    if result.success:
                        print(_success(f"Completed: {result.detail}"))
                    else:
                        print(_error(f"Failed: {result.error_message}"))
                        if not continue_on_error:
                            break

            # Save screenshot if requested
            if screenshot:
                screenshot.parent.mkdir(parents=True, exist_ok=True)
                await session.screenshot(str(screenshot))
                print(_info(f"Screenshot saved: {screenshot}"))

    except Exception as e:
        print(_error(f"Error: {str(e)}"))
        return False

    # Save results
    if json_output:
        json_output.parent.mkdir(parents=True, exist_ok=True)
        json_data = {
            "success": all(r.success for r in results),
            "task_count": len(results),
            "results": [
                {
                    "task_type": r.task_type,
                    "detail": r.detail,
                    "success": r.success,
                    "error": r.error_message,
                    "data": r.data,
                }
                for r in results
            ],
        }
        with open(json_output, "w") as f:
            json.dump(json_data, f, indent=2)
        print(_info(f"Results saved: {json_output}"))

    # Send to integrations
    for result in results:
        await integrations.send_results(
            {
                "success": result.success,
                "task_type": result.task_type,
                "detail": result.detail,
                "data": result.data,
            }
        )

    return all(r.success for r in results)


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    # Setup integrations
    integrations = IntegrationManager()
    if args.webhook:
        integrations.add_webhook(args.webhook)
    if args.slack:
        integrations.set_slack(args.slack)
    if args.db:
        integrations.set_database(args.db)
    if args.s3:
        integrations.set_s3(args.s3)

    # API mode
    if args.api:
        try:
            from api_server import create_server

            server = create_server(args.host, args.port)
            server.run()
            return 0
        except ImportError:
            print(_error("FastAPI not installed. Install with: pip install fastapi uvicorn"))
            return 1

    # Scheduler mode
    if args.schedule:
        try:
            schedule_mgr = ScheduleManager()

            async def scheduled_task():
                config = _config_from_choice(args.browser, headless=args.headless)
                tasks = _parse_task_chain(args.prompt or "")
                await _run_tasks(tasks, config, integrations)

            schedule_mgr.schedule_task("main_task", scheduled_task, args.schedule)

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(schedule_mgr.start())
            return 0
        except ImportError:
            print(_error("schedule not installed. Install with: pip install schedule"))
            return 1

    # Load workflow mode
    if args.load:
        try:
            workflow = load_workflow(args.load)
            tasks = workflow.tasks or []
            variables = workflow.variables or {}

            # Parse variables from command line
            if args.vars:
                for pair in args.vars.split(","):
                    key, value = pair.split("=")
                    variables[key.strip()] = value.strip()

            config = _config_from_choice(workflow.browser, headless=workflow.headless)

            success = asyncio.run(
                _run_tasks(
                    tasks,
                    config,
                    integrations,
                    variables,
                    args.continue_on_error,
                    screenshot=Path(workflow.screenshot) if workflow.screenshot else None,
                    json_output=args.json_output,
                    retries=workflow.retries,
                )
            )
            return 0 if success else 1
        except Exception as e:
            print(_error(f"Workflow error: {str(e)}"))
            return 1

    # Interactive mode
    if args.interactive or (not args.prompt and sys.stdin.isatty()):
        return asyncio.run(_interactive_session(args, integrations))

    # Single/chain execution mode
    if not args.prompt:
        try:
            args.prompt = input(_colorize("Enter task: ", Colors.CYAN))
        except EOFError:
            return 1

    if not args.prompt.strip():
        print(_error("No task provided"))
        return 1

    # Parse variables
    variables = {}
    if args.vars:
        for pair in args.vars.split(","):
            key, value = pair.split("=")
            variables[key.strip()] = value.strip()

    # Parse and execute tasks
    tasks = _parse_task_chain(args.prompt)
    config = _config_from_choice(args.browser, headless=args.headless)

    # Save workflow if requested
    if args.save:
        workflow = WorkflowConfig(
            name=args.prompt,
            browser=args.browser,
            headless=args.headless,
            tasks=tasks,
            variables=variables,
        )
        save_workflow(workflow, args.save)
        print(_success(f"Workflow saved: {args.save}"))

    # Execute tasks
    success = asyncio.run(
        _run_tasks(
            tasks,
            config,
            integrations,
            variables,
            args.continue_on_error,
            screenshot=args.screenshot,
            json_output=args.json_output,
            retries=args.retries,
        )
    )

    return 0 if success else 1


async def _interactive_session(args, integrations: IntegrationManager) -> int:
    """Interactive session."""
    print("\n" + _highlight("🚀 Browsing Agent Pro - Interactive Mode"))
    print(_info("Type 'help' for commands, 'exit' to quit\n"))

    history = []

    while True:
        try:
            prompt = input(_colorize("→ ", Colors.CYAN)).strip()

            if not prompt:
                continue
            elif prompt.lower() == "exit":
                print(_info("Goodbye!"))
                return 0
            elif prompt.lower() == "help":
                _show_help()
                continue
            elif prompt.lower() == "clear":
                print("\033[2J\033[H" if sys.stdout.isatty() else "\n" * 40)
                continue

            history.append(prompt)
            config = _config_from_choice(args.browser, headless=args.headless)
            tasks = _parse_task_chain(prompt)

            await _run_tasks(tasks, config, integrations)
            print()

        except KeyboardInterrupt:
            print(_warn("\nInterrupted"))
            return 1
        except EOFError:
            return 0


def _show_help():
    """Show help."""
    print(
        "\n"
        + _highlight(
            """
COMMANDS:
  go to <url>                  Navigate to URL
  search <query>               Google search
  extract <type> from <url>    Extract data
  click <selector>             Click element
  fill <selector> with <value> Fill form
  type <text> in <selector>    Type text
  press <key>                  Press key
  wait <selector>              Wait for element
  take screenshot              Save screenshot
  
USE COMMAS TO CHAIN TASKS:
  go to github.com, search python, click first result
  
SPECIAL COMMANDS:
  help     - Show this message
  clear    - Clear screen
  exit     - Quit
            """
        )
    )


if __name__ == "__main__":
    sys.exit(main())
