@echo off
setlocal
title AURUM (V0.1 React/TSX)
set "AURUM_HOST=aurum.me.marcodemont.ch"
set "AUTO_GIT_PULL=1"
cd /d "%~dp0"

if not exist "package.json" (
    echo [Fehler] package.json nicht gefunden.
    echo Erwartet wird das Projekt-Root mit package.json und vite.config.ts.
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

if "%AUTO_GIT_PULL%"=="1" (
    if exist ".git" (
        where git >nul 2>&1
        if errorlevel 1 (
            echo [Hinweis] Git nicht gefunden - ueberspringe automatisches Update aus GitHub.
        ) else (
            for /f %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "GIT_BRANCH=%%b"
            if not defined GIT_BRANCH (
                echo [Hinweis] Git-Branch konnte nicht gelesen werden - ueberspringe Pull.
            ) else (
                echo.
                echo  Hole aktuelle Aenderungen von GitHub ^(origin/%GIT_BRANCH%^)...
                git fetch origin
                if errorlevel 1 (
                    echo [Warnung] git fetch fehlgeschlagen - starte mit lokalem Stand.
                ) else (
                    git pull --ff-only origin %GIT_BRANCH%
                    if errorlevel 1 (
                        echo [Warnung] git pull fehlgeschlagen ^(evtl. lokale Konflikte^).
                        echo [Warnung] Bitte manuell pruefen: git status / git pull --rebase
                    )
                )
            )
        )
    ) else (
        echo [Hinweis] Kein .git-Verzeichnis gefunden - ueberspringe GitHub-Update.
    )
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

rem -- Pruefe Port 8006 (strictPort, sonst geht der Tunnel ins Leere) --
netstat -ano | findstr /R /C:"  TCP    .*:8006.*LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo  ======================================================
    echo  [Fehler] Port 8006 ist bereits belegt.
    echo  ======================================================
    echo.
    echo  Belegende Prozesse:
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:"  TCP    .*:8006.*LISTENING"') do (
        for /f "tokens=1,2 delims=," %%a in ('tasklist /FI "PID eq %%p" /FO csv /NH 2^>nul') do echo    PID %%p  %%~a
    )
    echo.
    echo  Loese den Konflikt im Task-Manager ^(PID beenden^), dann AURUM.bat neu starten.
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

if exist "%USERPROFILE%\.cloudflared\aurum.yml" (
    set TUNNEL_CONFIGURED=1
) else (
    set TUNNEL_CONFIGURED=0
)

echo.
echo  ======================================================
echo  AURUM (V0.1 React/TSX) startet auf Port 8006:
echo  ======================================================
echo.
echo  Lokal (Laptop):
echo    http://localhost:8006/
echo.
echo  Lokales WLAN (Tablet/Phone im selben Netz, HTTP, kein Mikro/Geo):
for /f "tokens=2 delims=: " %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo    http://%%a:8006/

if "%TUNNEL_AVAILABLE%"=="1" (
    if "%TUNNEL_CONFIGURED%"=="1" (
        echo.
        echo  Internet ^(HTTPS, Mikro/Geo OK^):
        echo    https://%AURUM_HOST%/
        echo.
        echo  Starte Cloudflare-Tunnel 'aurum' in separatem Fenster...
        start "AURUM Cloudflare Tunnel" cmd /k cloudflared tunnel --config "%USERPROFILE%\.cloudflared\aurum.yml" run aurum
    ) else (
        echo.
        echo  [Hinweis] Tunnel-Config %USERPROFILE%\.cloudflared\aurum.yml fehlt.
        echo  Setup-Schritte siehe AURUM\README.md, Abschnitt "Cloudflare-Tunnel".
    )
) else (
    echo.
    echo  [Hinweis] cloudflared nicht installiert - Internet-URL nicht verfuegbar.
)

echo.
echo  ======================================================
echo  AURUM ist die Haupt-App ^(ex-CUPRUM-Stand^).
echo  CUPRUM ist aktuell als leeres Werkstatt-Template reserviert.
echo.
echo  Druecke Strg+C im Server-Fenster, um AURUM zu beenden.
echo  Das Tunnel-Fenster musst du separat schliessen.
echo  ======================================================
echo.

start "" http://localhost:8006/
call npm run dev -- --port 8006 --host --strictPort
