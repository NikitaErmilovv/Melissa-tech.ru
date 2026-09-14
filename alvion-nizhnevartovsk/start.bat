@echo off
setlocal
cd /d "%~dp0"

if not exist "img\video" mkdir "img\video"
if exist "D:\4 in\Alvion\2.mp4" copy /Y "D:\4 in\Alvion\2.mp4" "img\video\hero.mp4" >nul

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8102" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Alvion — http://127.0.0.1:8102/
echo Press Ctrl+C to stop.
echo.

python -u server.py
if errorlevel 1 (
  echo.
  echo If python is missing, try: py -3 -u server.py
  pause
)
