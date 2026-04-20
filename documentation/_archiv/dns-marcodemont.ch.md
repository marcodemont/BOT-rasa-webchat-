## DNS-Backup | marcodemont.ch

Stand: 2026-04-19, Quelle: Hosttech KCP, Datei `DMS - marcodemont.ch.jpg`.

Zweck: Vollstaendiges Backup der DNS-Zone vor einem moeglichen Nameserver-Wechsel zu Cloudflare (fuer den AURUM-Tunnel auf `aurum.marcodemont.ch`). Vor dem Wechsel saemtliche Eintraege in Cloudflare 1:1 nachbauen.

---

### Registrar / Provider
- Registrar: Hosttech AG
- Aktuelle Nameserver: `ns1.hosttech.ch`, `ns2.hosttech.ch`, `ns3.hosttech.ch`
- Registriert seit: 28.09.2024
- Vertragsperiode aktuell: 28.09.2025 - 27.09.2026
- Jaehrliche Kosten: CHF 10.70

### Cloudflare-Migration (Ziel-Nameserver)
- `emely.ns.cloudflare.com`
- `rex.ns.cloudflare.com`
- Stand: zugewiesen am 2026-04-19, NS-Wechsel bei Hosttech ausstehend.

### DNSSEC
- **Status: EIN** (Zone signiert)
- DS Record: `51292 8 2 942CD6C34C619765F514823D79365C26201B4D46F69C1C4DC862C957D05D7A21`
- Status-Pruefung: 2026-04-19 20:53:21
- **Wichtig:** Vor Nameserver-Wechsel zu Cloudflare DNSSEC deaktivieren, sonst Downtime.

### SOA Record
- Domain: marcodemont.ch
- Verantwortliche E-Mail: dns@hosttech.eu
- Seriennummer: 2026040700
- Primaerer NS: ns1.hosttech.ch (im Screenshot abgeschnitten als "ns1.hostte...")

### A Records (IPv4)
| Host                | IP Adresse        | TTL   |
|---------------------|-------------------|-------|
| marcodemont.ch      | 185.178.193.168   | 10800 |
| *.marcodemont.ch    | 185.178.193.168   | 10800 |

Hinweis: Wildcard `*.marcodemont.ch` faengt aktuell alle Subdomains ab. Ein spezifischer CNAME fuer `aurum.marcodemont.ch` ueberschreibt den Wildcard nur fuer diese eine Subdomain.

### AAAA Records (IPv6)
| Host                | IP Adresse                              | TTL  |
|---------------------|-----------------------------------------|------|
| marcodemont.ch      | 2001:1680:0101:06cb:0000:0000:0000:0001 | 3600 |
| *.marcodemont.ch    | 2001:1680:0101:06cb:0000:0000:0000:0001 | 3600 |

Kompaktform: `2001:1680:101:6cb::1`. Verifiziert am 2026-04-19 aus Hosttech-Panel.

### MX Records
| Host           | Mail Exchanger      | TTL   | Praeferenz |
|----------------|---------------------|-------|------------|
| marcodemont.ch | mail1.hosttech.eu   | 10800 | 10         |
| marcodemont.ch | mail2.hosttech.eu   | 10800 | 10         |

### TXT Records
| Host                  | Inhalt                                | TTL   |
|-----------------------|---------------------------------------|-------|
| marcodemont.ch        | `v=spf1 +mx +a include:_spf.mail.hostserv.eu ~all` | 10800 |
| _dmarc.marcodemont.ch | `v=DMARC1; p=reject; pct=100`                      | 10800 |

Hinweis: Hosttech nutzt intern die Domain `hostserv.eu` fuer ihre SPF-Includes (nicht `hosttech.eu`). Verifiziert am 2026-04-19.

### Bekannte Subdomains
- *.marcodemont.ch (Wildcard, zeigt auf Hosttech-Webspace)

---

### Migrations-Checkliste (vor NS-Wechsel zu Cloudflare)

1. [x] Im Hosttech-DNS-Panel SPF- und AAAA-Records vollstaendig ablesen, in dieser Datei nachtragen.
2. [ ] In Cloudflare die Domain hinzufuegen, Auto-Scan laufen lassen, anschliessend Records mit dieser Datei abgleichen.
3. [ ] Fehlende Records in Cloudflare manuell nachtragen. (Bekannt fehlend nach Auto-Scan: A-Record fuer Apex `marcodemont.ch`, vor Continue-to-activation hinzufuegen.)
4. [ ] DNSSEC im Hosttech-Panel deaktivieren (Toggle auf Aus). Email-Adresse fuer Schluesselaenderungen leer lassen.
5. [ ] Warten ~30 Minuten, damit DS-Record am Registrar entfernt wird (sicher pruefen mit `nslookup -type=DS marcodemont.ch`, sollte leer sein).
6. [ ] Im Hosttech-Panel die Nameserver auf die zwei Cloudflare-NS aendern.
7. [ ] Warten 1-4 Stunden, bis Cloudflare die Domain als "Active" markiert.
8. [ ] CNAME fuer `aurum.marcodemont.ch` wird automatisch durch `cloudflared tunnel route dns` gesetzt.
9. [ ] Tunnel-Test: `https://aurum.marcodemont.ch/app/AURUM.html` im iPhone-Safari oeffnen.