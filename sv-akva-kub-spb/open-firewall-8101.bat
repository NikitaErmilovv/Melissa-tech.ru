@echo off
netsh advfirewall firewall delete rule name="Св-Аква Куб 198 Dev Server 8101" >nul 2>&1
netsh advfirewall firewall add rule name="Св-Аква Куб 198 Dev Server 8101" dir=in action=allow protocol=TCP localport=8101 profile=private,public
echo Firewall rule added for port 8101
