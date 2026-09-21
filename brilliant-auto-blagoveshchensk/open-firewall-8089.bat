@echo off
netsh advfirewall firewall add rule name="Brilliant auto 8090" dir=in action=allow protocol=TCP localport=8090
echo Firewall rule added for port 8090.
pause
