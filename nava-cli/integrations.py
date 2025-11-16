"""Cloud and API integrations for webhooks, databases, and storage."""

from __future__ import annotations

import json
import logging
import asyncio
import os
from typing import Any, Optional
from pathlib import Path

try:
    import aiohttp
except ImportError:
    aiohttp = None

try:
    import boto3
except ImportError:
    boto3 = None

try:
    from browser_use import Agent, Browser, Controller
    BROWSER_USE_AVAILABLE = True
except ImportError:
    BROWSER_USE_AVAILABLE = False
    Agent = None
    Browser = None
    Controller = None

try:
    from langchain_anthropic import ChatAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    ChatAnthropic = None

try:
    from langchain_openai import ChatOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    ChatOpenAI = None

try:
    from langchain_ollama import ChatOllama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    ChatOllama = None

logger = logging.getLogger(__name__)


class WebhookClient:
    """Send results to webhook endpoints."""

    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send(self, data: dict[str, Any]) -> bool:
        """Send data to webhook."""
        if not aiohttp:
            logger.error("aiohttp not installed. Install with: pip install aiohttp")
            return False

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.webhook_url,
                    json=data,
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    success = resp.status == 200
                    if success:
                        logger.info(f"Webhook sent: {self.webhook_url}")
                    else:
                        logger.error(f"Webhook failed: {resp.status}")
                    return success
        except Exception as e:
            logger.error(f"Webhook error: {str(e)}")
            return False


class SlackIntegration:
    """Send notifications to Slack."""

    def __init__(self, webhook_url: str):
        self.webhook = WebhookClient(webhook_url)

    async def notify(self, title: str, message: str, status: str = "info") -> bool:
        """Send notification to Slack."""
        colors = {
            "success": "#36a64f",
            "error": "#ff0000",
            "warning": "#ffa500",
            "info": "#0099ff",
        }

        payload = {
            "attachments": [
                {
                    "color": colors.get(status, colors["info"]),
                    "title": title,
                    "text": message,
                    "footer": "Nava",
                }
            ]
        }

        return await self.webhook.send(payload)


class DatabaseClient:
    """Store results in database."""

    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.db_type = self._detect_db_type(connection_string)

    def _detect_db_type(self, conn_str: str) -> str:
        """Detect database type from connection string."""
        if "postgresql" in conn_str or "postgres" in conn_str:
            return "postgresql"
        elif "mysql" in conn_str:
            return "mysql"
        elif "sqlite" in conn_str:
            return "sqlite"
        elif "mongodb" in conn_str:
            return "mongodb"
        else:
            return "unknown"

    async def save_results(self, table: str, data: dict[str, Any]) -> bool:
        """Save results to database."""
        logger.info(f"Database support: {self.db_type} - table '{table}'")
        logger.info(f"Would save: {json.dumps(data, indent=2)}")

        # Real implementation would use appropriate driver
        # For now, just log what would be done
        return True


class S3Client:
    """Upload results to AWS S3."""

    def __init__(self, bucket: str, aws_access_key: Optional[str] = None, aws_secret_key: Optional[str] = None):
        self.bucket = bucket
        self.aws_access_key = aws_access_key
        self.aws_secret_key = aws_secret_key

        if boto3:
            self.s3 = boto3.client(
                "s3",
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
            )
        else:
            self.s3 = None

    async def upload_file(self, file_path: str, s3_key: Optional[str] = None) -> bool:
        """Upload file to S3."""
        file_path = Path(file_path)

        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            return False

        if not self.s3:
            logger.error("boto3 not installed. Install with: pip install boto3")
            return False

        try:
            s3_key = s3_key or file_path.name
            self.s3.upload_file(str(file_path), self.bucket, s3_key)
            logger.info(f"Uploaded to S3: s3://{self.bucket}/{s3_key}")
            return True
        except Exception as e:
            logger.error(f"S3 upload error: {str(e)}")
            return False

    async def upload_data(self, data: dict[str, Any], s3_key: str) -> bool:
        """Upload JSON data to S3."""
        if not self.s3:
            logger.error("boto3 not installed")
            return False

        try:
            self.s3.put_object(
                Bucket=self.bucket,
                Key=s3_key,
                Body=json.dumps(data, indent=2),
                ContentType="application/json",
            )
            logger.info(f"Uploaded to S3: s3://{self.bucket}/{s3_key}")
            return True
        except Exception as e:
            logger.error(f"S3 upload error: {str(e)}")
            return False


class IntegrationManager:
    """Manage all integrations."""

    def __init__(self):
        self.webhooks: list[WebhookClient] = []
        self.slack: Optional[SlackIntegration] = None
        self.database: Optional[DatabaseClient] = None
        self.s3: Optional[S3Client] = None

    def add_webhook(self, url: str):
        """Add webhook endpoint."""
        self.webhooks.append(WebhookClient(url))

    def set_slack(self, webhook_url: str):
        """Set Slack integration."""
        self.slack = SlackIntegration(webhook_url)

    def set_database(self, connection_string: str):
        """Set database connection."""
        self.database = DatabaseClient(connection_string)

    def set_s3(self, bucket: str, access_key: Optional[str] = None, secret_key: Optional[str] = None):
        """Set S3 integration."""
        self.s3 = S3Client(bucket, access_key, secret_key)

    async def send_results(self, data: dict[str, Any]):
        """Send results to all configured integrations."""
        tasks = []

        # Send to webhooks
        for webhook in self.webhooks:
            tasks.append(webhook.send(data))

        # Send to Slack
        if self.slack:
            success = data.get("success", False)
            status = "success" if success else "error"
            title = "Task Completed" if success else "Task Failed"
            message = data.get("detail", "No details available")
            tasks.append(self.slack.notify(title, message, status))

        # Save to database
        if self.database:
            tasks.append(self.database.save_results("browser_results", data))

        # Upload to S3
        if self.s3:
            key = data.get("id", "result") + ".json"
            tasks.append(self.s3.upload_data(data, key))

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            logger.info(f"Integration results: {results}")


# Browser Use Integration Classes

class BrowserUseConfig:
    """Configuration for Browser Use integration."""

    def __init__(
        self,
        use_cloud: bool = False,
        emulate_mobile: bool = False,
        mobile_device: str = "iPhone 13 Pro",
        headless: bool = False,
    ):
        self.use_cloud = use_cloud
        self.emulate_mobile = emulate_mobile
        self.mobile_device = mobile_device
        self.headless = headless


def get_llm_for_browser_use():
    """Get the appropriate LLM for Browser Use based on available API keys."""
    
    # Try Anthropic Claude first (recommended)
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key and ANTHROPIC_AVAILABLE:
        logger.info("Using Anthropic Claude for Browser Use")
        return ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=anthropic_key,
            timeout=25,
            stop=None,
        )
    
    # Try OpenAI GPT
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key and OPENAI_AVAILABLE:
        logger.info("Using OpenAI GPT for Browser Use")
        return ChatOpenAI(
            model="gpt-4o",
            api_key=openai_key,
            timeout=25,
        )
    
    # Try Ollama (local, free)
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
    if OLLAMA_AVAILABLE:
        logger.info(f"Using Ollama ({ollama_model}) for Browser Use")
        return ChatOllama(
            model=ollama_model,
            base_url=ollama_base_url,
            timeout=25,
        )
    
    raise ValueError(
        "No LLM configuration found for Browser Use. "
        "Please set ANTHROPIC_API_KEY, OPENAI_API_KEY, or run Ollama locally. "
        "See .env.example for configuration details."
    )


async def create_browser_use_agent(
    task: str,
    config: Optional[BrowserUseConfig] = None,
) -> Optional[Agent]:
    """Create a Browser Use agent with the specified configuration."""
    
    if not BROWSER_USE_AVAILABLE:
        logger.error("browser-use package not installed. Install with: pip install browser-use")
        return None
    
    config = config or BrowserUseConfig()
    
    try:
        # Get LLM
        llm = get_llm_for_browser_use()
        
        # Configure browser for mobile emulation if needed
        browser_kwargs = {
            "headless": config.headless,
            "disable_security": False,
        }
        
        if config.emulate_mobile:
            # Mobile device configurations
            mobile_devices = {
                "iPhone 13 Pro": {
                    "viewport": {"width": 390, "height": 844},
                    "device_scale_factor": 3,
                    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
                },
                "iPhone 12": {
                    "viewport": {"width": 390, "height": 844},
                    "device_scale_factor": 3,
                    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
                },
                "Pixel 7": {
                    "viewport": {"width": 412, "height": 915},
                    "device_scale_factor": 2.625,
                    "user_agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
                },
                "iPad Pro": {
                    "viewport": {"width": 1024, "height": 1366},
                    "device_scale_factor": 2,
                    "user_agent": "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
                },
            }
            
            device_config = mobile_devices.get(
                config.mobile_device,
                mobile_devices["iPhone 13 Pro"]  # Default to iPhone 13 Pro
            )
            
            # Apply mobile configuration
            browser_kwargs.update({
                "viewport": device_config["viewport"],
                "device_scale_factor": device_config["device_scale_factor"],
                "user_agent": device_config["user_agent"],
            })
            
            logger.info(f"Mobile emulation enabled: {config.mobile_device}")
        
        # Create browser instance
        browser = Browser(**browser_kwargs)
        
        # Create agent
        agent = Agent(
            task=task,
            llm=llm,
            browser=browser,
        )
        
        logger.info(f"Browser Use agent created successfully")
        return agent
        
    except Exception as e:
        logger.error(f"Failed to create Browser Use agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


async def execute_with_browser_use(
    task: str,
    config: Optional[BrowserUseConfig] = None,
) -> dict[str, Any]:
    """Execute a task using Browser Use agent."""
    
    if not BROWSER_USE_AVAILABLE:
        return {
            "success": False,
            "error": "Browser Use not available. Install with: pip install browser-use",
            "fallback": "playwright",
        }
    
    try:
        agent = await create_browser_use_agent(task, config)
        
        if not agent:
            return {
                "success": False,
                "error": "Failed to create Browser Use agent",
                "fallback": "playwright",
            }
        
        # Execute the task
        logger.info(f"Executing task with Browser Use: {task}")
        result = await agent.run()
        
        # Extract results
        history = result.history() if hasattr(result, "history") else []
        final_result = result.final_result() if hasattr(result, "final_result") else str(result)
        
        return {
            "success": True,
            "result": final_result,
            "history": history,
            "screenshots": [],  # Browser Use handles screenshots internally
            "errors": [],
        }
        
    except Exception as e:
        logger.error(f"Browser Use execution error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "fallback": "playwright",
        }
