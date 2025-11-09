#!/usr/bin/env python3
"""Main entry point for Browsing Agent Pro."""

import sys
import logging
from cli import main as cli_main


def setup_logging(verbose: bool = False) -> None:
    """Configure logging."""
    level = logging.DEBUG if verbose else logging.WARNING
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    )


def main() -> int:
    """Main entry point."""
    setup_logging()

    try:
        return cli_main()
    except KeyboardInterrupt:
        return 1
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
