"""Cloud and API integrations for webhooks, databases, and storage."""

from __future__ import annotations

import json
import logging
import asyncio
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
