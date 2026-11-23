@echo off
cd /d "%~dp0"
echo Fantastika local server for phone preview (port 8135)
echo After start, open on phone: http://YOUR_LAPTOP_IP:8135/
echo Find IP: ipconfig ^(IPv4 of hotspot/Wi-Fi adapter^)
python server.py
