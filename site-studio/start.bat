@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Melissa Site Studio
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo Starting Site Studio on http://127.0.0.1:3847
set SITE_STUDIO_OPEN=1
start "" "http://127.0.0.1:3847"
node server.mjs