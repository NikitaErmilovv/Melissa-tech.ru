@echo off
netsh advfirewall firewall delete rule name="SDC Detailing Dev Server 8088" >nul 2>&1
netsh advfirewall firewall add rule name="SDC Detailing Dev Server 8088" dir=in action=allow protocol=TCP localport=8088 profile=private,public
echo Firewall rule added for port 8088
