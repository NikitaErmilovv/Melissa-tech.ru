@echo off
netsh advfirewall firewall delete rule name="RS Service Dev Server 8100" >nul 2>&1
netsh advfirewall firewall add rule name="RS Service Dev Server 8100" dir=in action=allow protocol=TCP localport=8100 profile=private,public
echo Firewall rule added for port 8100
