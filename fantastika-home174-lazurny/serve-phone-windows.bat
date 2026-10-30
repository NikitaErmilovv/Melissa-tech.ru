@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Fantastika: сервер для телефона (порт 8135) ===
echo.

where python >nul 2>&1
if errorlevel 1 (
  echo Python не найден. Установите Python 3 и повторите.
  pause
  exit /b 1
)

echo [1] Разрешаем порт 8135 в брандмауэре Windows...
netsh advfirewall firewall add rule name="Fantastika HTTP 8135" dir=in action=allow protocol=TCP localport=8135 >nul 2>&1
echo     Готово (или правило уже было).
echo.

echo [2] IPv4 на этом ноутбуке — ищите адрес адаптера раздачи / Wi‑Fi:
ipconfig | findstr /i "IPv4 Wireless адаптер беспровод Ethernet"
echo.
echo На ТЕЛЕФОНЕ откройте:  http://IPv4_ИЗ_СПИСКА_ВЫШЕ:8135/
echo НЕ используйте сайты «мой IP» — нужен локальный 192.168... или 172.20...
echo.
echo [3] Сначала на ноутбуке проверьте: http://127.0.0.1:8135/
echo     Если не открывается — сервер не запущен.
echo.
echo [4] Телефон: раздача включена, ноут к ней подключён, мобильный интернет на телефоне для браузера можно выключить.
echo.
pause
python server.py
