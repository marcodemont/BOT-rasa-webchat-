@echo off
setlocal
title CUPRUM (V0.1 React/TSX - Saubere Variante)
cd /d "%~dp0CUPRUM"

if not exist "package.json" (
    echo [Fehler] CUPRUM\package.json nicht gefunden.
    echo Erwartet wird der Ordner "CUPRUM\" mit package.json, vite.config.ts etc.
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [Fehler] Node.js ist nicht installiert oder nicht im PATH.
    echo Installiere Node.js LTS von https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo.
    echo  Erster Start: Installiere npm-Dependencies ^(dauert 1-3 Minuten^)...
    echo.
    call npm install
    if errorlevel 1 (
        echo [Fehler] npm install fehlgeschlagen.
        pause
        exit /b 1
    )
)

rem -- Pruefe Port 8008 (strictPort, sonst geht der Tunnel ins Leere) --
netstat -ano | findstr /R /C:"  TCP    .*:8008.*LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo  ======================================================
    echo  [Fehler] Port 8008 ist bereits belegt.
    echo  ======================================================
    echo.
    echo  Belegende Prozesse:
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:"  TCP    .*:8008.*LISTENING"') do (
        for /f "tokens=1,2 delims=," %%a in ('tasklist /FI "PID eq %%p" /FO csv /NH 2^>nul') do echo    PID %%p  %%~a
    )
    echo.
    echo  Loese den Konflikt im Task-Manager ^(PID beenden^), dann CUPRUM.bat neu starten.
    echo.
    pause
    exit /b 1
)

where cloudflared >nul 2>&1
if errorlevel 1 (
    set TUNNEL_AVAILABLE=0
) else (
    set TUNNEL_AVAILABLE=1
)

if exist "%USERPROFILE%\.cloudflared\cuprum.yml" (
    set TUNNEL_CONFIGURED=1
) else (
    set TUNNEL_CONFIGURED=0
)

echo.
echo  ======================================================
echo  CUPRUM (V0.1 React/TSX) startet auf Port 8008:
echo  ======================================================
echo.
echo  Lokal (Laptop):
echo    http://localhost:8008/
echo.
echo  Lokales WLAN (Tablet/Phone im selben Netz, HTTP, kein Mikro/Geo):
for /f "tokens=2 delims=: " %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo    http://%%a:8008/

if "%TUNNEL_AVAILABLE%"=="1" (
    if "%TUNNEL_CONFIGURED%"=="1" (
        echo.
        echo  Internet ^(HTTPS, Mikro/Geo OK^):
        echo    https://cuprum.marcodemont.ch/
        echo.
        echo  Starte Cloudflare-Tunnel 'cuprum' in separatem Fenster...
        start "CUPRUM Cloudflare Tunnel" cmd /k cloudflared tunnel --config "%USERPROFILE%\.cloudflared\cuprum.yml" run cuprum
    ) else (
        echo.
        echo  [Hinweis] Tunnel-Config %USERPROFILE%\.cloudflared\cuprum.yml fehlt.
        echo  Setup-Schritte siehe CUPRUM\README.md, Abschnitt "Cloudflare-Tunnel".
    )
) else (
    echo.
    echo  [Hinweis] cloudflared nicht installiert - Internet-URL nicht verfuegbar.
)

echo.
echo  ======================================================
echo  CUPRUM ist die saubere React/TS-Variante (Werkstatt).
echo  Laeuft parallel zu AURUM (8006, Live-Stand Monolith).
echo.
echo  Druecke Strg+C im Server-Fenster, um CUPRUM zu beenden.
echo  Das Tunnel-Fenster musst du separat schliessen.
echo  ======================================================
echo.

start "" http://localhost:8008/
call npm run dev -- --port 8008 --host --strictPort
