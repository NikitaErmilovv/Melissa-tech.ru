@echo off
echo === Tau Altay: server for phone preview (port 8141) ===
cd /d "%~dp0"
echo [1] Firewall rule for port 8141 (Windows)...
netsh advfirewall firewall add rule name="Tau Altay HTTP 8141" dir=in action=allow protocol=TCP localport=8141 >nul 2>&1
echo [2] Start: python server.py
echo On phone open: http://YOUR_LAPTOP_IP:8141/
python server.py