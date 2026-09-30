@echo off
setlocal
cd /d "%~dp0.."
git add brilliant-auto-blagoveshchensk/
git status --short brilliant-auto-blagoveshchensk/
git commit -m "Brilliant Auto: redeploy homepage photo-strip from master."
git push origin master
git log -1 --oneline
pause
