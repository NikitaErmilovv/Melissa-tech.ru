@echo off
netsh advfirewall firewall delete rule name="Krem Dev Server 8095" >nul 2>&1
netsh advfirewall firewall add rule name="Krem Dev Server 8095" dir=in action=allow protocol=TCP localport=8095 profile=private,public
echo Firewall rule added for port 8095
