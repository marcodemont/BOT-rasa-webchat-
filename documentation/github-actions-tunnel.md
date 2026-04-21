# AURUM via GitHub Actions + Cloudflare Tunnel (Test-Slots)

Diese Variante ist fuer **zeitlich begrenzte Testfenster** gedacht, nicht fuer 24/7-Betrieb.

## 1) Was im Repo enthalten ist

- Workflow: `.github/workflows/aurum-scheduled-tunnel.yml`
- Geplante UTC-Starts:
  - `30 4 * * *`  -> 06:30 Schweiz (CEST)
  - `0 7 * * *`   -> 09:00 Schweiz (CEST)
  - `45 9 * * *`  -> 11:45 Schweiz (CEST)
  - `30 12 * * *` -> 14:30 Schweiz (CEST)
  - `0 16 * * *`  -> 18:00 Schweiz (CEST)
- Laufzeiten pro Slot:
  - 70 min, 75 min, 105 min, 70 min, 360 min

> Achtung: GitHub-Cron laeuft in UTC. Bei Winterzeit (CET, UTC+1) musst du die Zeiten anpassen.

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
  Beispiel: `435a13b5-2e43-449a-a6a6-e3ccb5fa9f71`
- `AURUM_TUNNEL_CREDENTIALS_JSON`  
  kompletter Inhalt der Tunnel-Credentials-JSON als Secret-Wert

## 4) Was der Workflow pro Slot macht

1. Checkout vom Repo
2. Node 20 + `npm ci`
3. Schreiben von `~/.cloudflared/<tunnel-id>.json`
4. Erzeugen von `~/.cloudflared/aurum.yml`
5. Start von Vite (`npm run dev -- --host 0.0.0.0 --port 8006 --strictPort`)
6. Start von `cloudflared tunnel --config ... run`
7. Job laeuft bis Timeout und endet dann automatisch

## 5) Bekannte Grenzen

- Startverzoegerung bei Cron (typisch 5-15 Minuten moeglich)
- 6h Job-Limit in Actions (darueber wird beendet)
- Minutenverbrauch bei privaten Repos
