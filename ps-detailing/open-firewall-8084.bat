@echo off
netsh advfirewall firewall delete rule name="PS Detailing Dev Server 8084" >nul 2>&1
netsh advfirewall firewall add rule name="PS Detailing Dev Server 8084" dir=in action=allow protocol=TCP localport=8084 profile=private,public
echo Firewall rule added for port 8084
