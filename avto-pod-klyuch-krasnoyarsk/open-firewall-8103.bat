@echo off
netsh advfirewall firewall delete rule name="Авто Под Ключ Dev Server 8103" >nul 2>&1
netsh advfirewall firewall add rule name="Авто Под Ключ Dev Server 8103" dir=in action=allow protocol=TCP localport=8103 profile=private,public
echo Firewall rule added for port 8103
