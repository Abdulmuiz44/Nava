@echo off
REM Browsing Agent Runner for Windows
REM This batch file automatically detects Python and runs the agent

echo Browsing Agent - Starting...
echo.

REM Try to find Python
where python >nul 2>&1
if %errorlevel% == 0 (
    echo Found Python command
    set PYTHON_CMD=python
    goto :run_agent
)

where py >nul 2>&1
if %errorlevel% == 0 (
    echo Found py command
    set PYTHON_CMD=py
    goto :run_agent
)

REM Python not found
echo ERROR: Python not found!
echo.
echo Please install Python from https://python.org/downloads/
echo Make sure to check "Add Python to PATH" during installation
echo Then restart this command prompt and try again.
echo.
pause
exit /b 1

:run_agent
if "%1"=="" (
    echo No command provided. Starting interactive mode...
    %PYTHON_CMD% main.py
) else (
    echo Running: %PYTHON_CMD% main.py %*
    %PYTHON_CMD% main.py %*
)

echo.
echo Agent finished.
pause