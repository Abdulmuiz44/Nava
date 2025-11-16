"""
Comprehensive test script for Browser Use integration in Nava.

This script tests:
1. Browser Use agent with natural language commands
2. Mobile emulation with different devices
3. Fallback to Playwright when Browser Use is unavailable
4. Various task types (navigation, form filling, search, screenshot)
"""

import argparse
import asyncio
import logging
import os
from typing import Optional

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_browser_use_agent(task: str, mobile: bool = False, headless: bool = True):
    """Test Browser Use agent execution."""
    logger.info(f"\n{'='*60}")
    logger.info(f"Testing Browser Use Agent")
    logger.info(f"Task: {task}")
    logger.info(f"Mobile: {mobile}")
    logger.info(f"Headless: {headless}")
    logger.info(f"{'='*60}\n")
    
    try:
        from integrations import execute_with_browser_use, BrowserUseConfig
        
        config = BrowserUseConfig(
            use_cloud=False,
            emulate_mobile=mobile,
            mobile_device="iPhone 13 Pro" if mobile else "Desktop",
            headless=headless,
        )
        
        result = await execute_with_browser_use(task, config)
        
        if result.get("success"):
            logger.info("✓ Browser Use execution successful!")
            logger.info(f"Result: {result.get('result')}")
            if result.get("history"):
                logger.info(f"Steps taken: {len(result.get('history'))}")
        else:
            logger.error(f"✗ Browser Use execution failed: {result.get('error')}")
            
        return result
        
    except Exception as e:
        logger.error(f"✗ Error testing Browser Use: {str(e)}")
        return {"success": False, "error": str(e)}


async def test_playwright_fallback(task: str, mobile: bool = False, headless: bool = True):
    """Test Playwright fallback execution."""
    logger.info(f"\n{'='*60}")
    logger.info(f"Testing Playwright Fallback")
    logger.info(f"Task: {task}")
    logger.info(f"Mobile: {mobile}")
    logger.info(f"Headless: {headless}")
    logger.info(f"{'='*60}\n")
    
    try:
        from browser import BrowserSession, BrowserConfig
        from task_executor import execute_task
        
        config = BrowserConfig(
            headless=headless,
            emulate_mobile=mobile,
            mobile_device="iPhone 13 Pro" if mobile else "Desktop",
        )
        
        async with BrowserSession(config) as session:
            result = await execute_task(task, session)
            
            if result.success:
                logger.info("✓ Playwright execution successful!")
                logger.info(f"Task type: {result.task_type}")
                logger.info(f"Detail: {result.detail}")
            else:
                logger.error(f"✗ Playwright execution failed: {result.error_message}")
                
            return result
            
    except Exception as e:
        logger.error(f"✗ Error testing Playwright: {str(e)}")
        return None


async def test_mobile_emulation():
    """Test mobile emulation with different devices."""
    logger.info(f"\n{'='*60}")
    logger.info(f"Testing Mobile Emulation")
    logger.info(f"{'='*60}\n")
    
    devices = ["iPhone 13 Pro", "Pixel 7", "iPad Pro"]
    tasks = [
        "go to https://www.google.com",
        "search for mobile browser automation",
    ]
    
    from browser import BrowserSession, BrowserConfig
    from task_executor import execute_task
    
    for device in devices:
        logger.info(f"\n--- Testing device: {device} ---")
        
        config = BrowserConfig(
            headless=True,
            emulate_mobile=True,
            mobile_device=device,
        )
        
        try:
            async with BrowserSession(config) as session:
                for task in tasks:
                    result = await execute_task(task, session)
                    if result.success:
                        logger.info(f"✓ {task}: Success")
                    else:
                        logger.error(f"✗ {task}: Failed - {result.error_message}")
                    
                    await asyncio.sleep(1)  # Brief delay between tasks
                    
        except Exception as e:
            logger.error(f"✗ Error with device {device}: {str(e)}")


async def run_integration_tests(headless: bool = True):
    """Run comprehensive integration tests."""
    logger.info(f"\n{'#'*60}")
    logger.info(f"# Browser Use Integration Tests")
    logger.info(f"{'#'*60}\n")
    
    # Test cases
    test_cases = [
        {
            "name": "Navigation Test",
            "task": "go to https://example.com",
            "mobile": False,
        },
        {
            "name": "Search Test",
            "task": "search for artificial intelligence",
            "mobile": False,
        },
        {
            "name": "Mobile Navigation Test",
            "task": "go to https://www.github.com",
            "mobile": True,
        },
    ]
    
    results = []
    
    # Check if Browser Use is available
    try:
        from integrations import BROWSER_USE_AVAILABLE
        browser_use_available = BROWSER_USE_AVAILABLE
    except:
        browser_use_available = False
    
    logger.info(f"Browser Use Available: {browser_use_available}")
    logger.info(f"USE_BROWSER_USE env: {os.getenv('USE_BROWSER_USE', 'not set')}")
    logger.info("")
    
    # Test each case
    for i, test_case in enumerate(test_cases, 1):
        logger.info(f"\n[Test {i}/{len(test_cases)}] {test_case['name']}")
        logger.info("-" * 60)
        
        # Try Browser Use if available
        if browser_use_available and os.getenv("USE_BROWSER_USE", "false").lower() == "true":
            result = await test_browser_use_agent(
                task=test_case["task"],
                mobile=test_case["mobile"],
                headless=headless,
            )
            results.append({"test": test_case["name"], "method": "Browser Use", "result": result})
        else:
            logger.info("Skipping Browser Use (not available or not enabled)")
        
        # Always test Playwright as fallback
        result = await test_playwright_fallback(
            task=test_case["task"],
            mobile=test_case["mobile"],
            headless=headless,
        )
        results.append({"test": test_case["name"], "method": "Playwright", "result": result})
        
        await asyncio.sleep(2)  # Brief delay between tests
    
    # Test mobile emulation
    logger.info(f"\n[Additional Test] Mobile Device Emulation")
    logger.info("-" * 60)
    await test_mobile_emulation()
    
    # Summary
    logger.info(f"\n{'='*60}")
    logger.info(f"Test Summary")
    logger.info(f"{'='*60}")
    
    for result in results:
        status = "✓ PASS" if (
            isinstance(result["result"], dict) and result["result"].get("success")
        ) or (
            hasattr(result["result"], "success") and result["result"].success
        ) else "✗ FAIL"
        
        logger.info(f"{status} - {result['test']} ({result['method']})")


async def main() -> Optional[int]:
    """Main entry point for test script."""
    parser = argparse.ArgumentParser(
        description="Test Browser Use integration in Nava",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run all integration tests
  python test_browser_use.py --all
  
  # Test specific task with Browser Use
  python test_browser_use.py --task "go to https://example.com"
  
  # Test mobile emulation
  python test_browser_use.py --mobile --task "search cats"
  
  # Test mobile device emulation only
  python test_browser_use.py --test-mobile
        """
    )
    
    parser.add_argument(
        "--task",
        help="Specific task to test",
    )
    parser.add_argument(
        "--mobile",
        action="store_true",
        help="Enable mobile emulation",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=True,
        help="Run in headless mode (default: True)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run all integration tests",
    )
    parser.add_argument(
        "--test-mobile",
        action="store_true",
        help="Test mobile device emulation only",
    )
    
    args = parser.parse_args()
    
    try:
        if args.all:
            await run_integration_tests(headless=args.headless)
        elif args.test_mobile:
            await test_mobile_emulation()
        elif args.task:
            # Test specific task
            # Try Browser Use first
            if os.getenv("USE_BROWSER_USE", "false").lower() == "true":
                await test_browser_use_agent(
                    task=args.task,
                    mobile=args.mobile,
                    headless=args.headless,
                )
            
            # Test Playwright fallback
            await test_playwright_fallback(
                task=args.task,
                mobile=args.mobile,
                headless=args.headless,
            )
        else:
            # No arguments, run all tests
            await run_integration_tests(headless=args.headless)
        
        return 0
        
    except Exception as e:
        logger.error(f"Test execution failed: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main() or 0)
    if exit_code:
        raise SystemExit(exit_code)
