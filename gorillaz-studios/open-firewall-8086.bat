@echo off
netsh advfirewall firewall delete rule name="Gorillaz Studios Dev Server 8086" >nul 2>&1
netsh advfirewall firewall add rule name="Gorillaz Studios Dev Server 8086" dir=in action=allow protocol=TCP localport=8086 profile=private,public
echo Firewall rule added for port 8086
