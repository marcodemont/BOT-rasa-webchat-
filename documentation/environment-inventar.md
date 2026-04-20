# AURUM + ARGENTUM | Lokales Setup (Inventar)

Letzte Verifikation: 2026-04-20 00:55
System: Windows 11 Pro (Laptop marcodemont, 192.168.1.107 im WLAN)

Diese Datei haelt den Zustand des Entwicklungsrechners fest, damit Claude nicht jedes Mal alle Tools neu pruefen muss. Bei Neuinstallation/Versionswechsel hier updaten.

---

## Projekt-Konzept: zwei parallele Tracks

- **AURUM** = Live-Stand. Monolith-HTML (Vanilla JS + CSS in einer Datei). Stabil, hier landet Production-Code.
- **ARGENTUM** = Experimentier-Umgebung. React + TypeScript + Vite (aus Figma exportiert). Hier wird gebaut, getestet, experimentiert. Was funktioniert, wandert frueher oder spaeter nach AURUM (manueller Merge).

Beide laufen parallel auf unterschiedlichen Ports und haben eigene oeffentliche HTTPS-Subdomains via Cloudflare Tunnel.

| Track    | Subdomain                    | Port | Ordner      | Tech-Stack                                      |
|----------|------------------------------|------|-------------|-------------------------------------------------|
| AURUM    | `aurum.marcodemont.ch`       | 8006 | `AURUM/`    | Python http.server + Monolith-HTML (`app/AURUM.html`) |
| ARGENTUM | `argentum.marcodemont.ch`    | 8007 | `ARGENTUM/` | Vite Dev-Server + React + TSX + Tailwind + shadcn/ui |

Beide Bats koennen **gleichzeitig** laufen. Kein Port-Konflikt, zwei getrennte Tunnels.

---

## Projekt-Ordnerstruktur

```
C:\Users\marcodemont\Desktop\.AURUM - claude\
├── AURUM\                              ← Live-Stand
│   ├── app\
│   │   ├── AURUM.html                  ← die App (Monolith)
│   │   ├── sw.js                       ← Service Worker (Cache `aurum-v0-06-shell-3-weekview`)
│   │   ├── ble-ring.js
│   │   ├── index.html
│   │   ├── manifest.webmanifest
│   │   └── icon.svg
│   ├── mobile\                         ← Capacitor-Schicht (reserviert, nicht aktiv)
│   └── supabase\                       ← DB-Migrationen, Schema
├── ARGENTUM\                           ← Experimentier-Stand (aus Figma export)
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── components\
│   ├── modules\
│   ├── assets\
│   ├── node_modules\                   ← via npm install (ca. 360 Packages)
│   └── ...
├── documentation\                      ← Versions-Doku, DNS-Backups, dieses Inventar
├── dokumente\                          ← Diplomarbeits-PDFs
├── _archiv\                            ← Historische Staende
├── AURUM.bat                           ← Starter fuer Live-Stand
├── ARGENTUM.bat                        ← Starter fuer Experimentier-Stand
├── server.js                           ← Alternativer Node-Server (ungenutzt)
└── .gitignore

C:\Users\marcodemont\.cloudflared\      ← Tunnel-Config (ausserhalb Projekt)
├── cert.pem                            ← Origin-Zertifikat (via `cloudflared tunnel login`)
├── aurum.yml                           ← Config fuer aurum-Tunnel
├── argentum.yml                        ← Config fuer argentum-Tunnel
├── 435a13b5-2e43-449a-a6a6-e3ccb5fa9f71.json   ← Credentials aurum
└── 95375e06-d2d3-4c7e-8cb8-3eb896aec8ab.json   ← Credentials argentum
```

---

## Installierte Tools

| Tool          | Version       | Pfad                                                                         |
|---------------|---------------|------------------------------------------------------------------------------|
| Python        | 3.11.9        | `C:\Users\marcodemont\AppData\Local\Microsoft\WindowsApps\python.exe`        |
| Node.js       | v22.20.0 LTS  | (im PATH, Standard)                                                          |
| npm           | 11.6.1        | (mit Node.js)                                                                |
| cloudflared   | 2025.8.1      | `C:\Program Files (x86)\cloudflared\cloudflared.exe`                         |

**Hinweis:** cloudflared hat ein Upgrade auf 2026.3.0 verfuegbar (nicht kritisch, funktional OK).

---

## Cloudflare-Account & Domains

- Cloudflare-Konto: Google-Login via `marcodemont@bluewin.ch`
- Plan: Free
- `marcodemont.ch` | Status: Active | Nameserver zu Cloudflare migriert am 2026-04-19
- `studiodemont.ch` | Status: Invalid nameservers (noch bei Hosttech, nicht migriert)

### Zugewiesene Cloudflare-Nameserver fuer marcodemont.ch
- `emely.ns.cloudflare.com`
- `rex.ns.cloudflare.com`

### DNS-Records
Details: siehe `documentation/dns-marcodemont.ch.md`.

- A/AAAA Records (apex, `*.`, `www`): weiter auf Hosttech-Webspace
- MX: `mail1/mail2.hosttech.eu` (Email inaktiv, konfiguriert fuer Spoofing-Schutz)
- TXT SPF/DMARC: aktiv
- **CNAME** `aurum.marcodemont.ch` -> aurum-Tunnel (auto via `cloudflared tunnel route dns`)
- **CNAME** `argentum.marcodemont.ch` -> argentum-Tunnel

---

## Cloudflare Tunnels

### Tunnel "aurum"

| Feld              | Wert                                                                  |
|-------------------|-----------------------------------------------------------------------|
| Name              | `aurum`                                                               |
| UUID              | `435a13b5-2e43-449a-a6a6-e3ccb5fa9f71`                                |
| Erstellt          | 2026-04-19T21:35:12Z                                                  |
| Hostname          | `aurum.marcodemont.ch`                                                |
| Ziel (Ingress)    | `http://localhost:8006`                                               |
| Credentials-File  | `C:\Users\marcodemont\.cloudflared\435a13b5-2e43-449a-a6a6-e3ccb5fa9f71.json` |
| Config-File       | `C:\Users\marcodemont\.cloudflared\aurum.yml`                         |

### Tunnel "argentum"

| Feld              | Wert                                                                  |
|-------------------|-----------------------------------------------------------------------|
| Name              | `argentum`                                                            |
| UUID              | `95375e06-d2d3-4c7e-8cb8-3eb896aec8ab`                                |
| Erstellt          | 2026-04-19T22:36:45Z                                                  |
| Hostname          | `argentum.marcodemont.ch`                                             |
| Ziel (Ingress)    | `http://localhost:8007`                                               |
| Credentials-File  | `C:\Users\marcodemont\.cloudflared\95375e06-d2d3-4c7e-8cb8-3eb896aec8ab.json` |
| Config-File       | `C:\Users\marcodemont\.cloudflared\argentum.yml`                      |

### Tunnel manuell starten
```
cloudflared tunnel --config "%USERPROFILE%\.cloudflared\aurum.yml" run aurum
cloudflared tunnel --config "%USERPROFILE%\.cloudflared\argentum.yml" run argentum
```
Beides blockiert das jeweilige Terminal. In den Bats werden sie in separaten Fenstern gestartet.

### Tunnel als Windows-Dienst (noch nicht installiert)
Optional via `cloudflared service install` (als Administrator). Dann Autostart beim Boot.
Aktuell: manuell via `AURUM.bat` / `ARGENTUM.bat`.

---

## Starter (Batch-Dateien)

| Batch           | Zweck                                               | Port | Tunnel     | URL                                                          |
|-----------------|-----------------------------------------------------|------|------------|--------------------------------------------------------------|
| `AURUM.bat`     | Python-Server fuer Monolith + aurum-Tunnel          | 8006 | `aurum`    | `https://aurum.marcodemont.ch/app/AURUM.html`                |
| `ARGENTUM.bat`  | Vite-Dev-Server fuer React/TSX + argentum-Tunnel    | 8007 | `argentum` | `https://argentum.marcodemont.ch/`                           |

Beide Bats starten in separatem Fenster:
1. Den lokalen Server (blockierend)
2. Den Cloudflare-Tunnel (in zweitem `cmd`-Fenster via `start`)

### URLs (beide Tracks)

| URL                                                         | Zweck                                         |
|-------------------------------------------------------------|-----------------------------------------------|
| `http://localhost:8006/app/AURUM.html`                      | AURUM lokal, Laptop                           |
| `http://localhost:8007/`                                    | ARGENTUM lokal, Laptop                        |
| `http://192.168.1.107:8006/app/AURUM.html`                  | AURUM im WLAN, Tablet/Phone                   |
| `http://192.168.1.107:8007/`                                | ARGENTUM im WLAN, Tablet/Phone                |
| `https://aurum.marcodemont.ch/app/AURUM.html`               | AURUM via Internet (HTTPS)                    |
| `https://argentum.marcodemont.ch/`                          | ARGENTUM via Internet (HTTPS)                 |

### Beenden
- Server-Fenster: **Strg+C** im jeweiligen Fenster.
- Tunnel-Fenster: separat schliessen (X oder Strg+C). Windows-Bat kann Kind-Fenster nicht automatisch mit-beenden.

---

## ARGENTUM-spezifisch (Vite / React)

### Abweichung vom Figma-Export
Im ersten Stand war der `src/`-Ordner beim Verschieben entleert worden. `index.html` und `vite.config.ts` wurden temporaer angepasst (`/main.tsx` statt `/src/main.tsx`, `'@'` Alias auf `.` statt `./src`). Der Plan ist, das Figma-ZIP neu auszupacken, um den originalen `src/`-basierten Stand wiederherzustellen.

**Wenn das Zip neu entpackt wird, muss danach wieder erganzt werden:**
- In `ARGENTUM/vite.config.ts` unter `server:`:
  ```ts
  allowedHosts: ['argentum.marcodemont.ch', 'aurum.marcodemont.ch', '.trycloudflare.com'],
  ```
  Sonst blockiert Vite 6 Requests von custom Hostnames (Fehler: "Blocked request. This host is not allowed.").
  Ausserdem `open: true` aus dem `server:`-Block entfernen (sonst oeffnet sich der Browser doppelt — die `.bat` macht das schon).
- In `ARGENTUM/src/utils/supabase/info.tsx` projectId und publicAnonKey auf AURUMs Supabase-Projekt umstellen, damit Login/Sessions geteilt werden:
  ```ts
  export const projectId = "jitkxxpuzmopcrfvzzlz"
  export const publicAnonKey = "sb_publishable_dUNie_zHEDP4PKdMgUO20Q_buLMANmM"
  ```
  Default vom Figma-Export ist `fpvhmsbkcrmpdismpgsu` (eigenes Projekt) — das wuerde getrennte User bedeuten.

### Start im Dev-Modus
```
cd ARGENTUM
npm run dev -- --port 8007 --host
```
(passiert automatisch durch `ARGENTUM.bat`)

### Build fuer Produktion
```
cd ARGENTUM
npm run build
```
Output: `ARGENTUM/build/`. Kann mit Python-Server serviert werden.

---

## Capacitor-Setup (reserviert, noch nicht aktiv)

- Ordner `AURUM/mobile/` enthaelt `package.json` und `capacitor.config.ts`
- iOS-Build benoetigt macOS mit Xcode (auf Windows nicht moeglich)
- Android-Build waere auf Windows moeglich (Android Studio + Geraet/Emulator), noch nicht ausgefuehrt

---

## Secrets / .env

Wo: `.env` und `.env.example` liegen am Projekt-Root (`C:\Users\marcodemont\Desktop\.AURUM - claude\.env`).
Wird von `server.js` automatisch eingelesen (Zeile 8: `path.join(ROOT, '.env')`).

Geschuetzt durch `.gitignore` (Zeile 1: `.env`).

Inhalt: 4x OpenAI-Keys (FULL/ALT/READ_ONLY/DUPLICATE), OpenAI STT (Whisper) Key, Anthropic Key, Venice Key.

Backup-Quellen (falls Root-`.env` mal verloren geht):
- `documentation/diverses/.env` (alte Variante mit Stub-Werten fuer Anthropic/Venice)
- `documentation/diverses/API-Keys.md` (Klartext-Sammlung aller Keys)

Wichtig:
- `AURUM.bat` startet aktuell `python -m http.server 8006`, **nicht** `node server.js`. Heisst: `/api/transcribe` (Whisper STT) ist im Live-AURUM noch nicht erreichbar. Wenn STT genutzt werden soll, AURUM.bat auf `node server.js 8006` umstellen.
- ARGENTUM-Frontend (Vite) liest aktuell keine LLM-Keys direkt; falls noetig spaeter `ARGENTUM/.env` mit `VITE_*`-Praefix anlegen — aber sicherer ist, Calls ueber Backend (server.js oder Supabase Edge Function) zu routen, damit Keys nicht im Browser landen.

---

## Supabase

- Project URL: `https://jitkxxpuzmopcrfvzzlz.supabase.co`
- Publishable Key (hardcoded im Code): `sb_publishable_dUNie_zHEDP4PKdMgUO20Q_buLMANmM`
- Storage-Bucket: `audio-markers`
- Schema: Migrationen im Ordner `AURUM/supabase/`

---

## Ports-Belegung

| Port  | Nutzung                                     |
|-------|---------------------------------------------|
| 8006  | AURUM-Server (Python http.server)           |
| 8007  | ARGENTUM-Server (Vite Dev-Server)           |
| 3000  | (Vite default, durch `--port 8007` ueberschrieben) |
| 20241 | cloudflared Metrics (localhost only)        |

---

## Bekannte Fehlerquellen / Caveats

- **Service Worker Cache (AURUM)**: `AURUM/app/sw.js` cacht die Monolith-HTML mit cache-first-Strategie. Bei Aenderungen muss `CACHE_NAME` hochgezaehlt werden, sonst sieht Browser alten Stand trotz Hard-Reload. Aktueller Name: `aurum-v0-06-shell-3-weekview`.
- **Safari SW-Cache iPhone**: wenn auf dem iPhone mal Monolith besucht wurde, dann Cache explizit loeschen via Safari-Einstellungen -> Website-Daten -> `marcodemont.ch` entfernen. Oder: privaten Browser-Tab nutzen.
- **Tunnel blockt beim Schliessen des Fensters**: `cloudflared tunnel run` laeuft im Vordergrund. Fenster zu -> Tunnel aus -> Error 1033 auf aurum/argentum Subdomain. Loesung: Bat nochmal starten, oder Tunnel manuell via `cloudflared tunnel --config ...yml run aurum` im neuen Terminal.
- **Vite-allowedHosts**: bei Vite 6 muessen custom Hostnames in `vite.config.ts -> server.allowedHosts` hinzugefuegt werden, sonst blockiert Vite den Request (Fehlermeldung im Browser-Overlay).
- **Cloudflared-Version outdated**: Warnung beim Start, funktional OK.
- **cloudflared default config.yml-Fall**: Wenn beide Tunnels eine gemeinsame `config.yml` haetten (wie im allerersten Setup), verwirrt `cloudflared tunnel info X` den Tunnel-Namen. Loesung: beide haben jetzt eigene `aurum.yml` / `argentum.yml` und werden explizit via `--config <file>` referenziert.
