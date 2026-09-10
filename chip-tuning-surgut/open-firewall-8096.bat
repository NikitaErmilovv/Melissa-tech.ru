@echo off
netsh advfirewall firewall delete rule name="Chip tuning Surgut Dev Server 8096" >nul 2>&1
netsh advfirewall firewall add rule name="Chip tuning Surgut Dev Server 8096" dir=in action=allow protocol=TCP localport=8096 profile=private,public
echo Firewall rule added for port 8096
