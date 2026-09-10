@echo off
netsh advfirewall firewall delete rule name="GS-Auto Dev Server 8099" >nul 2>&1
netsh advfirewall firewall add rule name="GS-Auto Dev Server 8099" dir=in action=allow protocol=TCP localport=8099 profile=private,public
echo Firewall rule added for port 8099
