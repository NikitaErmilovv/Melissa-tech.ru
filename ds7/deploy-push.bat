@echo off
setlocal
cd /d "%~dp0.."
git add ds7/ README.md
git status --short ds7/ README.md
git commit -m "DS7: прототип детейлинг-центра, Нижний Новгород."
git push origin master
git log -1 --oneline
echo.
echo   https://melissa-tech.ru/ds7/
pause
