@echo off
cd /d "%~dp0.."
git add fantastika-home174-lazurny deploy-version.txt
git commit -m "Fantastika: deploy trigger" 2>nul
git push origin master
echo Push done. Timeweb should pull master, or run scripts\deploy-fantastika-rsync.sh with DEPLOY_SSH_KEY.
