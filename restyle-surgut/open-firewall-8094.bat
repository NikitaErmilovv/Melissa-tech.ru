@echo off
netsh advfirewall firewall delete rule name="Restyle Dev Server 8094" >nul 2>&1
netsh advfirewall firewall add rule name="Restyle Dev Server 8094" dir=in action=allow protocol=TCP localport=8094 profile=private,public
echo Firewall rule added for port 8094
