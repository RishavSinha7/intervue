@echo off
echo ================================
echo Live Polling System - Setup
echo ================================
echo.

echo [1/3] Installing server dependencies...
call npm install
if errorlevel 1 (
    echo Error installing server dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo Error installing client dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ================================
echo Installation Complete!
echo ================================
echo.
echo To start the application:
echo 1. Run server: npm start
echo 2. Run client (new terminal): cd client ^&^& npm start
echo.
pause
