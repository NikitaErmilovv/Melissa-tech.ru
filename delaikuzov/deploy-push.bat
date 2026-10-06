@echo off
setlocal
cd /d "%~dp0.."
git add delaikuzov/ README.md
git status --short delaikuzov/ README.md
git commit -m "Delaikuzov: publish under delaikuzov path for production."
git push origin master
git log -1 --oneline
echo.
echo   https://melissa-tech.ru/delaikuzov/
pause
