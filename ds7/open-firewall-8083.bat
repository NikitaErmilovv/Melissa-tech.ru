@echo off
netsh advfirewall firewall delete rule name="DS7 Dev Server 8083" >nul 2>&1
netsh advfirewall firewall add rule name="DS7 Dev Server 8083" dir=in action=allow protocol=TCP localport=8083 profile=private,public
echo Firewall rule added for port 8083
