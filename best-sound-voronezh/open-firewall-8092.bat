@echo off
:: Запустите этот файл от имени администратора (ПКМ -> Запуск от имени администратора)
netsh advfirewall firewall delete rule name="Best Sound Voronezh Dev Server 8092" >nul 2>&1
netsh advfirewall firewall add rule name="Best Sound Voronezh Dev Server 8092" dir=in action=allow protocol=TCP localport=8092 profile=private,public
if %errorlevel%==0 (
  echo OK: порт 8092 открыт для локальной сети.
) else (
  echo Ошибка. Нужны права администратора.
)
pause
