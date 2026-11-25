@echo off
git add deploy-version.txt tau-altay-cheremshanka
git diff --cached --quiet && echo Nothing to commit. && exit /b 0
git commit -m "Tau Altay: deploy bump (Timeweb pull master)"
git push