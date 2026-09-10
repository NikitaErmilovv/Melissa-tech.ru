@echo off
netsh advfirewall firewall delete rule name="Kaban-Detail Dev Server 8097" >nul 2>&1
netsh advfirewall firewall add rule name="Kaban-Detail Dev Server 8097" dir=in action=allow protocol=TCP localport=8097 profile=private,public
echo Firewall rule added for port 8097
