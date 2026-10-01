@echo off
setlocal
cd /d "%~dp0"
set PORT=8092

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Avtoblesk — http://127.0.0.1:%PORT%/#wrap
echo Press Ctrl+C to stop.
echo.

python -u server.py
if errorlevel 1 (
  echo.
  echo If python is missing, try: py -3 -u server.py
  pause
)
