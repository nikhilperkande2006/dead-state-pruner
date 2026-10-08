@echo off
title Dead-State Pruner App Installer
echo ========================================================
echo        Installing Dead-State Pruner Desktop App
echo ========================================================
echo.
echo Setting up application directory...

set "APP_DIR=%LOCALAPPDATA%\DeadStatePruner"
if not exist "%APP_DIR%" mkdir "%APP_DIR%"

echo Downloading application assets and icon...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://nikhilperkande2006.github.io/dead-state-pruner/app-icon.ico', '%APP_DIR%\app-icon.ico')"

echo Creating Windows Desktop Shortcut with App Icon...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $d = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$d\Dead-State Pruner.lnk\"); $s.TargetPath = 'msedge.exe'; $s.Arguments = '--app=https://nikhilperkande2006.github.io/dead-state-pruner/ --window-size=1280,800'; $s.IconLocation = '%APP_DIR%\app-icon.ico, 0'; $s.Description = 'Dead-State Pruner Desktop App'; $s.Save()"

echo.
echo ========================================================
echo  [SUCCESS] Dead-State Pruner App Installed on Desktop!
echo ========================================================
echo.
echo The app icon is now visible on your Windows Desktop screen.
echo Double-click it anytime to launch as a standalone desktop app.
echo.
pause
