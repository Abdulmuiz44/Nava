import argparse
import asyncio
from typing import Optional

from browser_use import BrowserUse

VALID_BROWSERS = ("chromium", "firefox", "webkit")

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a simple browser task based on a prompt.")
    parser.add_argument("prompt", nargs="?", help="Prompt describing the task, e.g. 'go to https://example.com'.")
    parser.add_argument(
        "--browser",
        choices=VALID_BROWSERS,
        help="Browser engine to launch. If omitted you will be prompted interactively.",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run the browser in headless mode (no UI).",
    )
    return parser.parse_args()


async def perform_task(prompt: str, browser_type: str = "chromium", *, headless: bool = False) -> None:
    clean_prompt = prompt.strip()
    if not clean_prompt:
        raise ValueError("Prompt must not be empty.")

    async with BrowserUse(browser_type=browser_type, headless=headless) as browser:
        print(f"Opening browser: {browser_type}")
        if clean_prompt.lower().startswith("go to "):
            url = clean_prompt[6:].strip()
            if not url:
                raise ValueError("No URL was provided after 'go to'.")
            print(f"Executing navigation to {url}")
            await browser.goto(url)
            print(f"Navigated to {url}")
        else:
            print(f"Executing search for: {clean_prompt}")
            await browser.goto("https://duckduckgo.com/?ia=web")
            await browser.type("input[name='q']", clean_prompt)
            await browser.press("input[name='q']", "Enter")
            print(f"Searched DuckDuckGo for: {clean_prompt}")


async def main() -> Optional[int]:
    args = parse_args()

    prompt = args.prompt
    if prompt is None:
        prompt = input("Enter your browsing task (e.g., 'go to https://example.com' or 'search cats'): ")

    browser_type = args.browser
    if browser_type is None:
        browser_type = input("Choose browser (chromium, firefox, webkit): ").strip().lower()

    if browser_type not in VALID_BROWSERS:
        print("Unrecognized browser type, defaulting to chromium.")
        browser_type = "chromium"

    prompt = prompt.strip()
    if not prompt:
        print("Prompt cannot be empty.")
        return 1

    print(f"Prompt: {prompt}")

    try:
        await perform_task(prompt, browser_type, headless=args.headless)
    except Exception as exc:  # noqa: BLE001 - provide friendly error output to the user
        print(f"Failed to execute task: {exc}")
        return 1

    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main() or 0)
    if exit_code:
        raise SystemExit(exit_code)
