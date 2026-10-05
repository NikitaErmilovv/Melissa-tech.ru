@echo off
setlocal
cd /d "%~dp0.."
git add vvs/
git status --short vvs/
git commit -m "VVS: redeploy site copy for vvs path and subdomain."
git push origin master
git log -1 --oneline
echo.
echo   https://melissa-tech.ru/vvs/
echo   https://vvs.melissa-tech.ru/
pause
