@echo off
netsh advfirewall firewall add rule name="АвтоБлеск 8092" dir=in action=allow protocol=TCP localport=8092
echo Firewall rule added for port 8092.
pause
