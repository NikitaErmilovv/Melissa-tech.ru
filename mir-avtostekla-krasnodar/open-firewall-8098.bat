@echo off
netsh advfirewall firewall delete rule name="Мир автостекла Dev Server 8098" >nul 2>&1
netsh advfirewall firewall add rule name="Мир автостекла Dev Server 8098" dir=in action=allow protocol=TCP localport=8098 profile=private,public
echo Firewall rule added for port 8098
