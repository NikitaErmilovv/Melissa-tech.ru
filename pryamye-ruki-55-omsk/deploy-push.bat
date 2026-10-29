@echo off
setlocal
cd /d "%~dp0\.."
git add deploy-version.txt pryamye-ruki-55-omsk
git status --short
git commit -m "Pryamye: выкладка на melissa-tech.ru (Timeweb pull master)"
git push origin master
git log -1 --oneline
pause
