@echo off
setlocal
cd /d "%~dp0\.."
git add deploy-version.txt inavto-avtoservis-irkutsk
git status --short
git commit -m "InAuto: выкладка на melissa-tech.ru (Timeweb pull master)"
git push origin master
git log -1 --oneline
pause
