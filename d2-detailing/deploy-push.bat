@echo off
setlocal
cd /d "%~dp0.."
git add d2-detailing/ README.md
git status --short d2-detailing/ README.md
git commit -m "D2 detailing: publish under d2-detailing path for production."
git push origin master
git log -1 --oneline
echo.
echo   https://melissa-tech.ru/d2-detailing/
pause
