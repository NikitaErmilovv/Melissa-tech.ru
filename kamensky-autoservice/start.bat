@echo off
cd /d "%~dp0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8090" ^| findstr "LISTENING"') do (
  taskkill /PID %%a /F >nul 2>&1
)
echo Автосервис Каменский — http://127.0.0.1:8090/
python -u server.py
