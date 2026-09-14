@echo off
setlocal
cd /d "%~dp0.."
if not exist "alvion-nizhnevartovsk\img\video" mkdir "alvion-nizhnevartovsk\img\video"
if exist "D:\4 in\Alvion\2.mp4" copy /Y "D:\4 in\Alvion\2.mp4" "alvion-nizhnevartovsk\img\video\hero.mp4"
git add alvion-nizhnevartovsk/
git reset alvion-nizhnevartovsk/_data/*.json 2>nul
git commit -m "Add Alvion gold theme, auth pages, and hero video."
git push origin master
pause
