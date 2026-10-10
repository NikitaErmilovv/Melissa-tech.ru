@echo off
setlocal
cd /d "%~dp0.."
git add altay-toner/
git status --short altay-toner/
git commit -m "Бруклин: прототип студии детейлинга, Магнитогорск."
git push origin master
git log -1 --oneline
echo.
echo   https://melissa-tech.ru/altay-toner/
pause
