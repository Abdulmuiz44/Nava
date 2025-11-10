@echo off
cls
echo.
echo ================================================================
echo                 PYTHON INSTALLATION FOR NAVA
echo ================================================================
echo.
echo I'll help you install Python! Here are your options:
echo.
echo OPTION 1: Microsoft Store (Recommended - Easiest)
echo -------------------------------------------------
echo 1. I just opened the Microsoft Store for you
echo 2. Click "Install" on the Python page
echo 3. Wait for installation to complete
echo 4. Come back here and press any key
echo.
echo OPTION 2: Manual Download (Most Reliable)
echo -----------------------------------------
echo 1. Go to: https://python.org/downloads/
echo 2. Click "Download Python 3.12.x"
echo 3. Run the installer
echo 4. CHECK "Add Python to PATH" !!!
echo 5. Click "Install Now"
echo 6. Come back here and press any key
echo.
echo OPTION 3: Use Chocolatey (Advanced Users)
echo -----------------------------------------
echo 1. Right-click PowerShell and "Run as Administrator"
echo 2. Run: choco install python -y
echo 3. Come back here and press any key
echo.
echo ================================================================

echo Opening Microsoft Store for you...
start ms-windows-store://pdp/?ProductId=9NRWMJP3717K

echo.
echo After installing Python, press any key to continue...
pause >nul

echo.
echo ================================================================
echo                    CHECKING PYTHON INSTALLATION
echo ================================================================

REM Check for Python
where python >nul 2>&1
if %errorlevel% == 0 (
    echo [SUCCESS] Found 'python' command
    set PYTHON_CMD=python
    goto :install_requirements
)

where py >nul 2>&1
if %errorlevel% == 0 (
    echo [SUCCESS] Found 'py' command
    set PYTHON_CMD=py
    goto :install_requirements
)

echo [ERROR] Python still not found!
echo.
echo Please try one of these solutions:
echo.
echo 1. RESTART this command prompt/PowerShell
echo 2. Make sure you checked "Add Python to PATH" during installation
echo 3. Try installing from: https://python.org/downloads/
echo.
echo Then run this script again.
pause
exit /b 1

:install_requirements
echo.
echo Python found! Installing Nava requirements...
echo.

echo Step 1/3: Installing Playwright...
%PYTHON_CMD% -m pip install playwright>=1.40.0
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Playwright
    echo Try running: %PYTHON_CMD% -m pip install --upgrade pip
    echo Then run this script again
    pause
    exit /b 1
)
echo [SUCCESS] Playwright installed!

echo.
echo Step 2/3: Installing Playwright browsers...
%PYTHON_CMD% -m playwright install chromium
if %errorlevel% neq 0 (
    echo [WARNING] Browser installation had issues
    echo You can try manually later: %PYTHON_CMD% -m playwright install chromium
) else (
    echo [SUCCESS] Chromium browser installed!
)

echo.
echo Step 3/3: Testing installation...
%PYTHON_CMD% -c "import playwright; print('[SUCCESS] Playwright is working!')"
if %errorlevel% neq 0 (
    echo [ERROR] Playwright test failed
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo ================================================================
echo                     INSTALLATION COMPLETE!
echo ================================================================
echo.
echo Python version:
%PYTHON_CMD% --version
echo.
echo You can now use Nava with these commands:
echo.
echo   %PYTHON_CMD% main.py "go to https://github.com"
echo   %PYTHON_CMD% main.py "search for python tutorials"
echo   %PYTHON_CMD% main.py
echo.
echo Or use the simple batch files:
echo   run.bat "go to https://example.com"
echo   run.bat
echo.
echo ================================================================
echo                       QUICK TEST
echo ================================================================
echo.
echo Let's test the agent right now!
set /p test_choice="Would you like to test it? (y/n): "
if /i "%test_choice%"=="y" (
    echo.
    echo Testing with: go to https://github.com
    %PYTHON_CMD% main.py "go to https://github.com"
)

echo.
echo All done! Press any key to exit...
pause >nul