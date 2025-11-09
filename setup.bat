@echo off
REM Setup script for Browsing Agent on Windows

echo ========================================
echo    Browsing Agent Setup for Windows
echo ========================================
echo.

REM Check for Python
echo Checking for Python...
where python >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Found Python
    set PYTHON_CMD=python
    goto :install_deps
)

where py >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Found Python (py command)
    set PYTHON_CMD=py
    goto :install_deps
)

echo [ERROR] Python not found!
echo.
echo Please follow these steps:
echo 1. Go to https://python.org/downloads/
echo 2. Download Python 3.8 or newer
echo 3. During installation, CHECK "Add Python to PATH"
echo 4. Restart this command prompt
echo 5. Run this setup again
echo.
pause
exit /b 1

:install_deps
echo.
echo Installing Python dependencies...
%PYTHON_CMD% -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Installing browser (Chromium)...
%PYTHON_CMD% -m playwright install chromium
if %errorlevel% neq 0 (
    echo [WARNING] Browser installation may have failed
    echo You can try manually: %PYTHON_CMD% -m playwright install chromium
)

echo.
echo Testing installation...
%PYTHON_CMD% -c "import playwright; print('[OK] Playwright imported successfully')"
if %errorlevel% neq 0 (
    echo [ERROR] Installation test failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo        Setup Complete! 
echo ========================================
echo.
echo You can now use the Browsing Agent:
echo.
echo   run.bat "go to https://github.com"
echo   run.bat "search for python tutorials"
echo   run.bat
echo.
echo Or use Python directly:
echo   %PYTHON_CMD% main.py "your command here"
echo.
pause