@echo off
netsh advfirewall firewall delete rule name="Kamensky Autoservice 8090" >nul 2>&1
netsh advfirewall firewall add rule name="Kamensky Autoservice 8090" dir=in action=allow protocol=TCP localport=8090 profile=private,public
echo Firewall rule added for port 8090.
