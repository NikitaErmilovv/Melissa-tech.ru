@echo off
setlocal
cd /d "%~dp0\.."
git add deploy-version.txt fantastika-home174-lazurny
git status --short
git commit -m "Fantastika: выкладка на melissa-tech.ru (Timeweb pull master)"
git push origin master
git log -1 --oneline
pause
