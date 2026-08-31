@echo off
netsh advfirewall firewall delete rule name="Kgcustom Dev Server 8085" >nul 2>&1
netsh advfirewall firewall add rule name="Kgcustom Dev Server 8085" dir=in action=allow protocol=TCP localport=8085 profile=private,public
echo Firewall rule added for port 8085
