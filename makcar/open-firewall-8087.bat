@echo off
netsh advfirewall firewall delete rule name="MakCar Dev Server 8087" >nul 2>&1
netsh advfirewall firewall add rule name="MakCar Dev Server 8087" dir=in action=allow protocol=TCP localport=8087 profile=private,public
echo Firewall rule added for port 8087
