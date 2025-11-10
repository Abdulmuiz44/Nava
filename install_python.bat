@echo off
echo ============================================================
echo     PYTHON INSTALLATION GUIDE FOR NAVA
echo ============================================================
echo.
echo STEP 1: Download and Install Python
echo ------------------------------------
echo 1. Open your web browser
echo 2. Go to: https://python.org/downloads/windows/
echo 3. Click "Download Python 3.12.x" (latest version)
echo 4. Run the downloaded installer
echo 5. *** IMPORTANT *** Check "Add Python to PATH" 
echo 6. Click "Install Now"
echo 7. Wait for installation to complete
echo 8. Restart this command prompt
echo.
echo STEP 2: Verify Installation
echo ---------------------------
echo After restarting cmd/PowerShell, run:
echo   python --version
echo OR:
echo   py --version
echo.
echo You should see: Python 3.12.x
echo.
echo STEP 3: Install Nava Requirements
echo ------------------------------------------
echo Once Python is installed, run this file again
echo and it will automatically install all requirements!
echo.
echo ============================================================

REM Check if Python is already installed
where python >nul 2>&1
if %errorlevel% == 0 goto :python_found

where py >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=py
    goto :python_found
)

echo [STATUS] Python not found - please follow the steps above
echo.
pause
exit /b 1

:python_found
set PYTHON_CMD=python
where python >nul 2>&1
if %errorlevel% neq 0 set PYTHON_CMD=py

echo [SUCCESS] Python found! Installing requirements...
echo.

echo Installing Playwright...
%PYTHON_CMD% -m pip install playwright>=1.40.0
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Playwright
    pause
    exit /b 1
)

echo Installing asyncio-compat...
%PYTHON_CMD% -m pip install asyncio-compat>=0.1.2
if %errorlevel% neq 0 (
    echo [WARNING] asyncio-compat installation failed (may not be needed)
)

echo.
echo Installing Playwright browsers...
%PYTHON_CMD% -m playwright install chromium
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install browser binaries
    echo Try running: %PYTHON_CMD% -m playwright install chromium
    pause
    exit /b 1
)

echo.
echo Testing installation...
%PYTHON_CMD% -c "import playwright; print('[SUCCESS] Playwright ready!')"
if %errorlevel% neq 0 (
    echo [ERROR] Installation test failed
    pause
    exit /b 1
)

echo.
echo ============================================================
echo               INSTALLATION COMPLETE!
echo ============================================================
echo.
echo You can now use Nava:
echo.
echo   %PYTHON_CMD% main.py "go to https://github.com"
echo   %PYTHON_CMD% main.py "search for python tutorials"
echo   %PYTHON_CMD% main.py
echo.
echo Or use the batch files:
echo   run.bat "go to https://example.com"
echo   run.bat
echo.
echo ============================================================
pause