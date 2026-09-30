@echo off
setlocal
cd /d "%~dp0"
echo === Brilliant Auto: full deploy (HTML + CSS + JS + img) ===
git add brilliant-auto-blagoveshchensk/
for /f %%i in ('git rev-parse --short HEAD') do set REV=%%i
echo git=%REV%>> brilliant-auto-blagoveshchensk\deploy-version.txt
git add brilliant-auto-blagoveshchensk/deploy-version.txt
git status --short brilliant-auto-blagoveshchensk/
git commit -m "Brilliant Auto: full site redeploy (services, gallery, media)."
if errorlevel 1 (
  echo Nothing to commit or commit failed.
  exit /b 1
)
git push origin master
echo.
echo Verify after server pull:
echo   https://melissa-tech.ru/brilliant-auto-blagoveshchensk/deploy-version.txt
echo   https://melissa-tech.ru/brilliant-auto-blagoveshchensk/services.html
echo   https://melissa-tech.ru/brilliant-auto-blagoveshchensk/gallery.html
git log -1 --oneline
pause
