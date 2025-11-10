#!/usr/bin/env python3
"""Setup script for Nava."""

import subprocess
import sys
import os
from pathlib import Path


def run_command(cmd, description=""):
    """Run a command and handle errors gracefully."""
    print(f"Running: {description or cmd}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success: {description or cmd}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {description or cmd}")
        print(f"Error: {e.stderr}")
        return False


def check_python():
    """Check if Python is available and get version."""
    try:
        version = subprocess.check_output([sys.executable, "--version"], text=True).strip()
        print(f"✅ Found Python: {version}")
        return True
    except Exception as e:
        print(f"❌ Python check failed: {e}")
        return False


def install_requirements():
    """Install Python requirements."""
    requirements_file = Path(__file__).parent / "requirements.txt"
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    cmd = f"{sys.executable} -m pip install -r {requirements_file}"
    return run_command(cmd, "Installing Python dependencies")


def install_browsers():
    """Install Playwright browsers."""
    cmd = f"{sys.executable} -m playwright install chromium"
    return run_command(cmd, "Installing Chromium browser")


def test_installation():
    """Test if the installation works."""
    print("\n🧪 Testing installation...")
    try:
        # Import test
        import playwright
        print("✅ Playwright imported successfully")
        
        # Try importing our modules
        sys.path.insert(0, str(Path(__file__).parent))
        from browser import BrowserConfig
        print("✅ Browser module imported successfully")
        
        from task_executor import TaskResult
        print("✅ Task executor module imported successfully")
        
        print("✅ All imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False


def main():
    """Main setup function."""
    print("🤖 Nava Setup")
    print("=" * 30)
    
    # Check Python
    if not check_python():
        print("Please install Python 3.8+ and try again.")
        return 1
    
    # Install requirements
    print("\n📦 Installing dependencies...")
    if not install_requirements():
        print("Failed to install Python dependencies.")
        return 1
    
    # Install browsers
    print("\n🌐 Installing browsers...")
    if not install_browsers():
        print("Failed to install browsers. You can try manually:")
        print("python -m playwright install chromium")
    
    # Test installation
    if not test_installation():
        print("Installation test failed. Check the errors above.")
        return 1
    
    print("\n🎉 Setup completed successfully!")
    print("\nYou can now use Nava:")
    print(f"  {sys.executable} main.py \"go to https://example.com\"")
    print(f"  {sys.executable} main.py \"search for python tutorials\"")
    
    return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)