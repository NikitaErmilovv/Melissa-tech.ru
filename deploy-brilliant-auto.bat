@echo off
setlocal
cd /d "%~dp0"
set SITE=brilliant-auto-blagoveshchensk
echo === Verify homepage (photo-strip, not v2 cards) ===
findstr /C:"photo-strip--home" "%SITE%\index.html" >nul || (echo MISSING photo-strip on index & exit /b 1)
findstr /C:"cards--services" "%SITE%\index.html" >nul && (echo ERROR: v2 cards on index & exit /b 1)
findstr /C:"service-desc" "%SITE%\services.html" >nul || (echo MISSING services catalog & exit /b 1)
findstr /C:"gallery-lightbox" "%SITE%\gallery.html" >nul || (echo MISSING gallery lightbox & exit /b 1)
git add %SITE%/
git status --short %SITE%/
git commit -m "Brilliant Auto: sync index, services, gallery for production."
if errorlevel 1 exit /b 1
git push origin master
echo.
echo Check (Ctrl+U for site-build meta):
echo   https://melissa-tech.ru/brilliant-auto-blagoveshchensk/
echo   https://melissa-tech.ru/brilliant-auto-blagoveshchensk/services.html
echo   https://melissa-tech.ru/brilliant-auto-blagoveshchensk/gallery.html
git log -1 --oneline
pause
