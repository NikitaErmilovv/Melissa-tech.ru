@echo off
setlocal
cd /d "%~dp0"

if not exist "img\video" mkdir "img\video"
if not exist "img\video\hero.mp4" if exist "D:\4 in\Alvion\2.mp4" copy /Y "D:\4 in\Alvion\2.mp4" "img\video\hero.mp4" >nul

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8102" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Alvion
echo Сайт откроется сам: http://127.0.0.1:8102/
echo Это окно не закрывайте, пока проверяете сайт.
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8102/"

python -u server.py
if errorlevel 1 py -3 -u server.py
if errorlevel 1 (
  echo.
  echo Не найден Python. Установите Python 3 с python.org и запустите start.bat снова.
  pause
)
