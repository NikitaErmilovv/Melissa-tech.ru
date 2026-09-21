@echo off
netsh advfirewall firewall delete rule name="АвтоБлеск Dev Server 8092" >nul 2>&1
netsh advfirewall firewall add rule name="АвтоБлеск Dev Server 8092" dir=in action=allow protocol=TCP localport=8092 profile=private,public
echo Firewall rule added for port 8092
