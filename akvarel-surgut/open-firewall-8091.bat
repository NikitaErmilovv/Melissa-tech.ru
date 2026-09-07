@echo off
netsh advfirewall firewall delete rule name="Akvarel Surgut 8091" >nul 2>&1
netsh advfirewall firewall add rule name="Akvarel Surgut 8091" dir=in action=allow protocol=TCP localport=8091 profile=private,public
echo Firewall rule added for port 8091
pause
