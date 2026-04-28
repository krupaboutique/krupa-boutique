@echo off
title Krupa Boutique Server
color 0A

:: Change to the folder where this bat file is located
:: This handles folder names with spaces like "krupa boutique"
cd /d "%~dp0"

echo.
echo  ============================================
echo    KRUPA BOUTIQUE - Server Starting...
echo  ============================================
echo.

:: Kill any old server on port 3000
taskkill /F /IM node.exe >nul 2>&1

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Node.js is NOT installed!
    echo.
    echo  Please install it:
    echo  1. Go to https://nodejs.org
    echo  2. Download LTS version
    echo  3. Install it
    echo  4. Restart computer
    echo  5. Run this file again
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

echo  [OK] Node.js is installed
echo  [OK] Starting Krupa Boutique Server...
echo.
echo  ============================================
echo.
echo   Server URL:  http://localhost:3000
echo.
echo   Admin Login:
echo     Email   : krupaboutique@gmail.com
echo     Password: admin123
echo.
echo   Tailor Login:
echo     Use phone number + password set by admin
echo.
echo  ============================================
echo.
echo  Opening browser automatically...
echo  DO NOT close this window!
echo.

:: Wait 2 seconds then open browser
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

:: Run server with node (NOT Windows Script Host)
node server.js

echo.
echo  Server stopped.
pause
