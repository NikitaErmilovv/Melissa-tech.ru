@echo off
:: Запустите этот файл от имени администратора (ПКМ -> Запуск от имени администратора)
netsh advfirewall firewall delete rule name="Skolov38 Dev Server 8082" >nul 2>&1
netsh advfirewall firewall add rule name="Skolov38 Dev Server 8082" dir=in action=allow protocol=TCP localport=8082 profile=private,public
if %errorlevel%==0 (
  echo OK: порт 8082 открыт для локальной сети.
) else (
  echo Ошибка. Нужны права администратора.
)
pause
