@echo off
netsh advfirewall firewall delete rule name="Dark Detailing Dev Server 8089" >nul 2>&1
netsh advfirewall firewall add rule name="Dark Detailing Dev Server 8089" dir=in action=allow protocol=TCP localport=8089 profile=private,public
echo Firewall rule added for port 8089
