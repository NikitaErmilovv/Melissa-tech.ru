@echo off
setlocal
cd /d "%~dp0"
git add deploy-version.txt scripts/sync_gallery_album.py scripts/generate_gallery_manifest.py
git add pervushin-avtokompleks-ekaterinburg pervyy-rul-masterskaya-novokuznetsk prime38-detailing-angarsk proffkar-avtotekhservis-tyumen klyaksa-tuning-noyabrsk mir-tonirovki-tobolsk imperiya-avtokompleks-chelyabinsk
git status --short
git commit -m "Gallery albums: static manifest and JS fallback for Timeweb."
git push origin master
git log -1 --oneline
pause
