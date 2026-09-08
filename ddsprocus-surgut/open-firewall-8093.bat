@echo off
netsh advfirewall firewall delete rule name="DDSproCustoms Dev Server 8093" >nul 2>&1
netsh advfirewall firewall add rule name="DDSproCustoms Dev Server 8093" dir=in action=allow protocol=TCP localport=8093 profile=private,public
echo Firewall rule added for port 8093
