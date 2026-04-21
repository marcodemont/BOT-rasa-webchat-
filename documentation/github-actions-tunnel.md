# AURUM via GitHub Actions + Cloudflare Tunnel (30-Minuten-Zyklen mit 15-Minuten-Offset)

Diese Variante ist fuer **kontinuierliche Stundenslots** gedacht:

- **Online-Fenster:** `00-15` und `30-45` jeder Stunde
- **Offline-/Fix-Fenster:** `15-30` und `45-00` jeder Stunde

Damit laeuft die App automatisch im 30-Minuten-Takt, plus einem um 15 Minuten versetzten zweiten Takt.

## 1) Was im Repo enthalten ist

- Workflow: `.github/workflows/aurum-scheduled-tunnel.yml`
- Trigger: `*/15 * * * *` (alle 15 Minuten, 24/7, auch nachts)
- Slot-Logik in UTC-Minuten:
  - `00` oder `30` -> `app` (Tunnel + Dev-Server online)
  - `15` oder `45` -> `maintenance` (App bleibt offline, Build-Check laeuft)

> Hinweis: GitHub-Cron laeuft in UTC und kann mit leichter Verzoegerung starten (typisch 5-15 Minuten).

## 2) Cloudflare Named Tunnel vorbereiten (einmalig)

Lokal auf einem Rechner mit `cloudflared`:

```bash
cloudflared tunnel create aurum
cloudflared tunnel route dns aurum aurum.me.marcodemont.ch
cloudflared tunnel token aurum
```

Alternativ mit Credentials-Datei:

```bash
cloudflared tunnel info aurum
```

Notiere:
- Tunnel-ID
- Credentials-JSON (Dateiinhalt)

## 3) GitHub Secrets setzen

In GitHub -> Settings -> Secrets and variables -> Actions:

- `AURUM_TUNNEL_ID`
- `AURUM_TUNNEL_CREDENTIALS_JSON`

## 4) Was der Workflow pro Slot macht

### In jedem aktiven Slot (`00/15/30/45`)

1. Checkout vom Repo
2. Node 20 + `npm ci`
3. `npm run build` als Funktions-/Integritaetscheck

### In App-Slots (`00` und `30`)

4. Schreibt Cloudflare-Konfiguration nach `~/.cloudflared`
5. Startet App (`npm run dev -- --host 0.0.0.0 --port 8006 --strictPort`)
6. Startet `cloudflared tunnel ... run`
7. Fuehrt Healthcheck auf `http://127.0.0.1:8006` aus
8. Haelt das Fenster ca. 14 Minuten offen, dann kontrolliertes Beenden

### In Maintenance-Slots (`15` und `45`)

4. App bleibt absichtlich offline
5. Slot ist fuer Bugfix-/Merge-/Stabilisierungsfenster vorgesehen

## 5) Bekannte Grenzen

- Startverzoegerung bei Cron moeglich
- Laufzeitlimit pro Actions-Job
- Minutenverbrauch bei privaten Repos
- Der Workflow validiert automatisiert (`npm run build`), behebt Bugs aber nicht selbststaendig ohne neue Commits
