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
    ORANGE = "\033[38;5;208m"


def _colorize(text: str, color: str) -> str:
    if sys.stdout.isatty():
        return f"{color}{text}{Colors.RESET}"
    return text


def _success(text: str) -> str:
    return _colorize(f"+ {text}", Colors.GREEN)


def _error(text: str) -> str:
    return _colorize(f"- {text}", Colors.RED)


def _info(text: str) -> str:
    return _colorize(f"i {text}", Colors.BLUE)


def _warn(text: str) -> str:
    return _colorize(f"! {text}", Colors.YELLOW)


def _highlight(text: str) -> str:
    return _colorize(text, Colors.BOLD)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=_highlight("🌐 Nava Pro - Advanced Browser Automation"),
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
  
  # Keep browser open
  %(prog)s "go to github.com" --keep-open
  
  # Interactive mode
  %(prog)s -i
        """,
    )

    # Basic options
    parser.add_argument("prompt", nargs="?", help="Task or comma-separated tasks")
    parser.add_argument("--browser", default="chrome", choices=_BROWSER_MAP.keys(), help="Browser engine")
    parser.add_argument("--headless", action="store_true", help="Run headless")
    parser.add_argument("-i", "--interactive", action="store_true", help="Interactive mode")
    parser.add_argument("--keep-open", action="store_true", help="Keep browser open after tasks complete")

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
    parser.add_argument("--nav-timeout", type=float, default=30.0, help="Navigation timeout (seconds)")
    parser.add_argument("--element-timeout", type=float, default=10.0, help="Element wait timeout (seconds)")
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


def _config_from_choice(choice: str, *, headless: bool, nav_timeout: float = 30.0, element_timeout: float = 10.0, keep_open: bool = False) -> BrowserConfig:
    browser_type, channel = _BROWSER_MAP[choice]
    return BrowserConfig(
        browser_type=browser_type, 
        channel=channel, 
        headless=headless,
        navigation_timeout=nav_timeout * 1000,  # Convert to milliseconds
        element_timeout=element_timeout * 1000,
        keep_open=keep_open
    )


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
                config = _config_from_choice(args.browser, headless=args.headless, nav_timeout=args.nav_timeout, element_timeout=args.element_timeout, keep_open=args.keep_open)
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

            config = _config_from_choice(workflow.browser, headless=workflow.headless, nav_timeout=args.nav_timeout, element_timeout=args.element_timeout, keep_open=args.keep_open)

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
    config = _config_from_choice(args.browser, headless=args.headless, nav_timeout=args.nav_timeout, element_timeout=args.element_timeout, keep_open=args.keep_open)

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
    """Premium interactive session with sleek, modern design."""
    import os
    import time
    from datetime import datetime
    import math
    
    # Session state
    session = {
        'history': [],
        'current_input': '',
        'stats': {
            'tasks_completed': 0,
            'tasks_failed': 0,
            'session_start': datetime.now(),
            'last_command': None,
            'start_time': time.time()
        },
        'theme': 'midnight'  # Sleek dark theme
    }
    
    # Enhanced color palette for modern look
    class ThemeColors:
        # Primary colors
        PRIMARY = "\033[38;5;147m"      # Soft lavender
        ACCENT = "\033[38;5;140m"       # Purple accent
        SUCCESS = "\033[38;5;120m"      # Mint green
        WARNING = "\033[38;5;221m"      # Soft pink
        ERROR = "\033[38;5;203m"        # Rose red
        INFO = "\033[38;5;110m"         # Sky blue
        
        # Text colors
        TEXT_PRIMARY = "\033[38;5;252m"  # Light gray
        TEXT_SECONDARY = "\033[38;5;245m" # Medium gray
        TEXT_MUTED = "\033[38;5;238m"     # Dark gray
        
        # Background colors
        BG_HIGHLIGHT = "\033[48;5;236m"   # Dark blue bg
        BG_PANEL = "\033[48;5;235m"       # Darkest bg
        
        # Special effects
        GRADIENT_START = "\033[38;5;147m"
        GRADIENT_END = "\033[38;5;140m"
        GLOW = "\033[38;5;159m"           # Bright cyan
        
    def _tcolorize(text: str, color: str) -> str:
        """Theme-aware colorize function."""
        if sys.stdout.isatty():
            return f"{color}{text}{Colors.RESET}"
        return text
    
    def _create_gradient(text: str, start_color: str, end_color: str) -> str:
        """Create gradient text effect."""
        if not sys.stdout.isatty():
            return text
        
        colors = [start_color, end_color]
        gradient_text = ""
        text_length = len(text)
        
        for i, char in enumerate(text):
            color_index = int((i / text_length) * (len(colors) - 1))
            gradient_text += f"{colors[color_index]}{char}"
        
        return f"{gradient_text}{Colors.RESET}"
    
    def _show_welcome_animation():
        """Show compact welcome animation with rich, bold NAVA text."""
        time.sleep(0.8)
    
    def _show_elegant_header():
        """Display elegant header with beautiful NAVA branding design."""
        header = """
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│      ╔═════════════════════════════════════════════════╗        │
│      ║                                                 ║        │
│      ║  ███╗   ██╗  █████╗   ██╗   ██╗  █████╗  ║        │
│      ║  ████╗  ██║ ██╔══██╗  ██║   ██║ ██╔══██╗ ║        │
│      ║  ██╔██╗ ██║ ███████║  ██║   ██║ ███████║ ║        │
│      ║  ██║╚██╗██║ ██╔══██║  ╚██╗ ██╔╝ ██╔══██║ ║        │
│      ║  ██║ ╚████║ ██║  ██║   ╚████╔╝  ██║  ██║ ║        │
│      ║  ╚═╝  ╚═══╝ ╚═╝  ╚═╝    ╚═══╝   ╚═╝  ╚═╝ ║        │
│      ║                                                 ║        │
│      ╚═════════════════════════════════════════════════╝        │
│                                                                 │
│              INTELLIGENT BROWSER AUTOMATION                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ● Premium Features:      ● Smart Commands                      │
│ ● Lightning Fast:        ● Real-time Analytics                 │
└─────────────────────────────────────────────────────────────────┘
"""
        print(header)
    
    def _show_live_stats():
        """Display beautiful live statistics panel."""
        elapsed = datetime.now() - session['stats']['session_start']
        total_tasks = session['stats']['tasks_completed'] + session['stats']['tasks_failed']
        success_rate = (session['stats']['tasks_completed'] / max(1, total_tasks)) * 100
        
        # Create progress bar
        bar_length = 20
        filled = int((success_rate / 100) * bar_length)
        progress_bar = "█" * filled + "░" * (bar_length - filled)
        
        stats = f"""
{_tcolorize('╭───────────────────── LIVE STATS ─────────────────────╮', ThemeColors.TEXT_MUTED)}
{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('⏱️  Session:', ThemeColors.INFO)} {_tcolorize(str(elapsed).split('.')[0], ThemeColors.TEXT_PRIMARY)} {" " * 30} {_tcolorize('│', ThemeColors.TEXT_MUTED)}
{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('✅ Completed:', ThemeColors.SUCCESS)} {_tcolorize(str(session["stats"]["tasks_completed"]), ThemeColors.TEXT_PRIMARY)} {" " * 29} {_tcolorize('│', ThemeColors.TEXT_MUTED)}
{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('❌ Failed:', ThemeColors.ERROR)} {_tcolorize(str(session["stats"]["tasks_failed"]), ThemeColors.TEXT_PRIMARY)} {" " * 33} {_tcolorize('│', ThemeColors.TEXT_MUTED)}
{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('📈 Success Rate:', ThemeColors.WARNING)} {_tcolorize(f'{success_rate:.1f}%', ThemeColors.TEXT_PRIMARY)} {" " * 26} {_tcolorize('│', ThemeColors.TEXT_MUTED)}
{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('📊 Progress:', ThemeColors.PRIMARY)} [{_tcolorize(progress_bar, ThemeColors.SUCCESS)}] {" " * 15} {_tcolorize('│', ThemeColors.TEXT_MUTED)}
{_tcolorize('╰───────────────────────────────────────────────────────╯', ThemeColors.TEXT_MUTED)}
"""
        print(stats)
    
    def _show_command_palette():
        """Display elegant command palette."""
        commands = [
            ("🌐", "go to <url>", "Navigate anywhere"),
            ("🔍", "search <query>", "Find anything"),
            ("📊", "extract <data>", "Extract information"),
            ("🎯", "click <element>", "Interact with pages"),
            ("📝", "fill <form>", "Complete forms"),
            ("📸", "take screenshot", "Capture moments")
        ]
        
        palette = f"\n{_tcolorize('╭────────────────────── COMMAND PALETTE ──────────────────────╮', ThemeColors.TEXT_MUTED)}"
        for icon, cmd, desc in commands:
            palette += f"\n{_tcolorize('│', ThemeColors.TEXT_MUTED)} {icon} {_tcolorize(cmd.ljust(20), ThemeColors.PRIMARY)} {_tcolorize('•', ThemeColors.TEXT_MUTED)} {_tcolorize(desc, ThemeColors.TEXT_SECONDARY)} {" " * 15} {_tcolorize('│', ThemeColors.TEXT_MUTED)}"
        palette += f"\n{_tcolorize('╰──────────────────────────────────────────────────────────╯', ThemeColors.TEXT_MUTED)}"
        
        print(palette)
    
    def _show_elegant_prompt():
        """Display beautiful, simple command prompt."""
        # Simple, clean prompt with subtle animation
        indicators = ["●", "○", "■", "□"]
        indicator = indicators[int(time.time() * 2) % len(indicators)]
        
        # Clean, minimalist prompt design
        prompt_line = f"\n{_tcolorize('┌─ NAVA COMMAND ─────────────────────────────────────────┐', ThemeColors.TEXT_MUTED)}"
        prompt_line += f"\n{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize(indicator, ThemeColors.GLOW)} {_tcolorize('Enter your command:', ThemeColors.TEXT_PRIMARY)} "
        
        return prompt_line
    
    def _show_success_animation(message: str):
        """Show beautiful success animation."""
        for i in range(3):
            symbols = ["✨", "⭐", "💫", "🌟"]
            symbol = symbols[i % len(symbols)]
            print(f"\r  {symbol} {_tcolorize(message, ThemeColors.SUCCESS)} {symbol}", end="", flush=True)
            time.sleep(0.2)
        print(f"\r  ✨ {_tcolorize(message, ThemeColors.SUCCESS)} ✨")
    
    def _show_error_animation(message: str):
        """Show elegant error display."""
        print(f"\n  ❌ {_tcolorize(message, ThemeColors.ERROR)}")
    
    def _show_elegant_help():
        """Display comprehensive help with beautiful formatting."""
        help_sections = [
            ("🌐 NAVIGATION", [
                "go to <url> - Navigate to any website",
                "search <query> - Google search anything",
                "back - Go back in browser history",
                "refresh - Reload current page"
            ]),
            ("🎯 INTERACTION", [
                "click <selector> - Click any element",
                "fill <selector> with <text> - Fill form fields",
                "type <text> in <selector> - Type text",
                "press <key> - Press keyboard keys",
                "wait for <selector> - Wait for elements"
            ]),
            ("📊 DATA EXTRACTION", [
                "extract <type> from <url> - Extract data",
                "extract all links - Get all links",
                "extract headings - Get page headings",
                "extract images - Get all images"
            ]),
            ("💎 PREMIUM FEATURES", [
                "stats - Show session statistics",
                "history - View command history",
                "clear - Clear terminal screen",
                "help - Show this beautiful help",
                "exit - End session gracefully"
            ])
        ]
        
        print(f"\n{_tcolorize('╔══════════════════════════════════════════════════════════════════╗', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('║', ThemeColors.TEXT_MUTED)} {_create_gradient('📖 NAVI PRO COMMAND REFERENCE', ThemeColors.GRADIENT_START, ThemeColors.GRADIENT_END)} {_tcolorize('║', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('╚══════════════════════════════════════════════════════════════════╝', ThemeColors.TEXT_MUTED)}")
        
        for title, commands in help_sections:
            print(f"\n{_tcolorize(f'  {title}', ThemeColors.PRIMARY)}")
            for cmd in commands:
                print(f"    {_tcolorize('•', ThemeColors.TEXT_MUTED)} {_tcolorize(cmd.split(' - ')[0], ThemeColors.ACCENT)} - {_tcolorize(cmd.split(' - ')[1], ThemeColors.TEXT_SECONDARY)}")
        
        print(f"\n{_tcolorize('💡 Pro Tip: Chain commands with commas for automation magic!', ThemeColors.WARNING)}")
    
    def _show_history():
        """Display command history with elegant formatting."""
        if not session['history']:
            print(f"\n  {_tcolorize('📝 No commands in history yet. Start your journey!', ThemeColors.TEXT_MUTED)}")
            return
        
        print(f"\n{_tcolorize('╭────────────────────── COMMAND HISTORY ──────────────────────╮', ThemeColors.TEXT_MUTED)}")
        for i, cmd in enumerate(reversed(session['history'][-8:]), 1):
            print(f"{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize(f'{len(session["history"]) - i + 1:2d}.', ThemeColors.WARNING)} {_tcolorize(cmd[:50], ThemeColors.TEXT_PRIMARY)}{'...' if len(cmd) > 50 else ''} {' ' * (50 - len(cmd))} {_tcolorize('│', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('╰──────────────────────────────────────────────────────────╯', ThemeColors.TEXT_MUTED)}")
    
    def _show_detailed_stats():
        """Show comprehensive statistics with beautiful design."""
        elapsed = datetime.now() - session['stats']['session_start']
        total_tasks = session['stats']['tasks_completed'] + session['stats']['tasks_failed']
        success_rate = (session['stats']['tasks_completed'] / max(1, total_tasks)) * 100
        avg_time = (time.time() - session['stats']['start_time']) / max(1, total_tasks)
        
        print(f"\n{_tcolorize('╭────────────────────── SESSION ANALYTICS ─────────────────────╮', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('⏱️  Session Duration:', ThemeColors.INFO)} {_tcolorize(str(elapsed).split('.')[0], ThemeColors.TEXT_PRIMARY)} {" " * 25} {_tcolorize('│', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('📊 Total Commands:', ThemeColors.PRIMARY)} {_tcolorize(str(len(session['history'])), ThemeColors.TEXT_PRIMARY)} {" " * 27} {_tcolorize('│', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('✅ Tasks Completed:', ThemeColors.SUCCESS)} {_tcolorize(str(session['stats']['tasks_completed']), ThemeColors.TEXT_PRIMARY)} {" " * 25} {_tcolorize('│', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('❌ Tasks Failed:', ThemeColors.ERROR)} {_tcolorize(str(session['stats']['tasks_failed']), ThemeColors.TEXT_PRIMARY)} {" " * 29} {_tcolorize('│', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('📈 Success Rate:', ThemeColors.WARNING)} {_tcolorize(f'{success_rate:.1f}%', ThemeColors.TEXT_PRIMARY)} {" " * 30} {_tcolorize('│', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('⚡ Avg Task Time:', ThemeColors.ACCENT)} {_tcolorize(f'{avg_time:.2f}s', ThemeColors.TEXT_PRIMARY)} {" " * 29} {_tcolorize('│', ThemeColors.TEXT_MUTED)}")
        print(f"{_tcolorize('╰──────────────────────────────────────────────────────────╯', ThemeColors.TEXT_MUTED)}")
    
    # Initialize beautiful session
    _show_welcome_animation()
    _show_elegant_header()
    _show_live_stats()
    _show_command_palette()

    while True:
        try:
            # Display elegant prompt and get input
            prompt_display = _show_elegant_prompt()
            user_input = input(prompt_display).strip()
            
            # Clear the prompt line after input
            print(f"\r{_tcolorize('│', ThemeColors.TEXT_MUTED)} {_tcolorize('●', ThemeColors.GLOW)} {_tcolorize('Enter your command:', ThemeColors.TEXT_PRIMARY)} {_tcolorize(user_input, ThemeColors.TEXT_PRIMARY)}")
            print(f"{_tcolorize('└───────────────────────────────────────────────────────────────┘', ThemeColors.TEXT_MUTED)}")
            
            if not user_input:
                continue
            
            cmd_lower = user_input.lower()
            
            # Handle special commands with elegance
            if cmd_lower in ['exit', 'quit', 'q']:
                _show_success_animation(f"Session Complete! {session['stats']['tasks_completed']} tasks completed")
                time.sleep(1)
                print(f"\n  {_tcolorize('Thank you for using NAVA PRO! 🌟', ThemeColors.GLOW)}")
                return 0
            
            elif cmd_lower == 'help':
                _show_elegant_help()
                continue
            
            elif cmd_lower == 'clear':
                print(f"\033[2J\033[H", end="")
                _show_elegant_header()
                _show_live_stats()
                continue
            
            elif cmd_lower == 'history':
                _show_history()
                continue
            
            elif cmd_lower == 'stats':
                _show_detailed_stats()
                continue
            
            # Execute browser task with beautiful feedback
            print(f"\n  {_tcolorize('🚀 Executing:', ThemeColors.PRIMARY)} {_tcolorize(user_input, ThemeColors.TEXT_PRIMARY)}")
            print(f"  {_tcolorize('⏳ Processing...', ThemeColors.INFO)}", end="", flush=True)
            
            session['history'].append(user_input)
            session['stats']['last_command'] = user_input
            
            config = _config_from_choice(args.browser, headless=args.headless, nav_timeout=args.nav_timeout, element_timeout=args.element_timeout, keep_open=args.keep_open)
            tasks = _parse_task_chain(user_input)
            
            # Execute with timing and feedback
            start_time = time.time()
            print(f"\r  {_tcolorize('⚡ In progress...', ThemeColors.WARNING)}", end="", flush=True)
            
            success = await _run_tasks(tasks, config, integrations)
            execution_time = time.time() - start_time
            
            # Show results with beautiful animations
            if success:
                session['stats']['tasks_completed'] += len(tasks)
                _show_success_animation(f"Completed in {execution_time:.2f}s")
            else:
                session['stats']['tasks_failed'] += 1
                _show_error_animation(f"Failed after {execution_time:.2f}s")
            
            # Update live stats
            print(f"\n")
            _show_live_stats()
            print(f"\n  {_tcolorize('💡 Ready for your next command!', ThemeColors.INFO)}")
            print(f"  {_tcolorize('Type "help" for options or "stats" for performance', ThemeColors.TEXT_MUTED)}")
            
        except KeyboardInterrupt:
            print(f"\n\n  {_tcolorize('⚠️  Session interrupted gracefully', ThemeColors.WARNING)}")
            print(f"  {_tcolorize(f'📝 Saved {len(session["history"])} commands in history', ThemeColors.INFO)}")
            _show_detailed_stats()
            return 1
        
        except EOFError:
            _show_success_animation("Goodbye!")
            print(f"\n  {_tcolorize('🌟 Thanks for using NAVA PRO!', ThemeColors.GLOW)}")
            return 0
        
        except Exception as e:
            session['stats']['tasks_failed'] += 1
            _show_error_animation(f"Unexpected error: {str(e)}")
            print(f"  {_tcolorize('🔄 Continuing session...', ThemeColors.INFO)}")
            time.sleep(1)


def _show_help():
    """Show basic help for non-interactive mode."""
    print(
        "\n"
        + _highlight(
            """
🚀 QUICK COMMANDS:
  go to <url>                  Navigate to website
  search <query>               Google search
  extract <type> from <url>    Extract data
  click <selector>             Click element
  fill <selector> with <value> Fill form
  type <text> in <selector>    Type text
  press <key>                  Press key
  wait <selector>              Wait for element
  take screenshot              Save screenshot
  
⚡ CHAIN TASKS WITH COMMAS:
  go to github.com, search python, click first result
  
💡 Use interactive mode (-i) for enhanced features!
            """
        )
    )


if __name__ == "__main__":
    sys.exit(main())
