@echo off
netsh advfirewall firewall delete rule name="Alvion Dev Server 8102" >nul 2>&1
netsh advfirewall firewall add rule name="Alvion Dev Server 8102" dir=in action=allow protocol=TCP localport=8102 profile=private,public
echo Firewall rule added for port 8102
