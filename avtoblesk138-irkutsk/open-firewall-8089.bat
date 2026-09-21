@echo off
netsh advfirewall firewall add rule name="Автоблеск138 8091" dir=in action=allow protocol=TCP localport=8091
echo Firewall rule added for port 8091.
pause
