@echo off
netsh advfirewall firewall delete rule name="Carstyle Dev Server 8104" >nul 2>&1
netsh advfirewall firewall add rule name="Carstyle Dev Server 8104" dir=in action=allow protocol=TCP localport=8104 profile=private,public
echo Firewall rule added for port 8104
