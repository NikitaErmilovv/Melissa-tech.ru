@echo off
setlocal
cd /d "%~dp0"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8087" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo.
echo MakCar — http://127.0.0.1:8087/
echo Press Ctrl+C to stop.
echo.

python -u server.py
if errorlevel 1 (
  echo.
  echo If python is missing, try: py -3 -u server.py
  pause
)
