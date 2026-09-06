@echo off
netsh advfirewall firewall add rule name="Dark Detailing 8089" dir=in action=allow protocol=TCP localport=8089
echo Firewall rule added for port 8089.
pause
