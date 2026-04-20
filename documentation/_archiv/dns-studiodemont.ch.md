## DNS-Backup | studiodemont.ch

Stand: 2026-04-19, Quelle: Hosttech KCP, Datei `DMS - studiodemont.ch.jpg`.

Zweck: Vollstaendiges Backup der DNS-Zone als Referenz. Falls AURUM stattdessen unter `aurum.studiodemont.ch` laufen soll, gelten die gleichen Migrations-Schritte wie fuer marcodemont.ch.

---

### Registrar / Provider
- Registrar: Hosttech AG
- Aktuelle Nameserver: `ns1.hosttech.ch`, `ns2.hosttech.ch`, `ns3.hosttech.ch`
- Registriert seit: 22.08.2025
- Vertragsperiode aktuell: 22.08.2025 - 21.08.2026
- Jaehrliche Kosten: CHF 14.70 (inkl. CHF 4.00 DNSSEC-Gebuehr)

### DNSSEC
- **Status: AUS** (Zone nicht signiert)
- Hinweis im Hosttech-Panel: "Erst wenn du DNSSEC auch bei deinem Domainregistrar aktivierst, wird die Signierung deiner Zone aktiv."
- Vorteil bei Migration: kein DNSSEC-Deaktivierungs-Schritt notwendig.

### SOA Record
- Domain: studiodemont.ch
- Verantwortliche E-Mail: dns@hosttech.eu
- Seriennummer: 2025080100
- Primaerer NS: ns1.hosttech.ch (im Screenshot abgeschnitten als "ns1.hostte...")

### A Records (IPv4)
| Host                | IP Adresse        | TTL   |
|---------------------|-------------------|-------|
| studiodemont.ch     | 185.101.158.113   | 10800 |
| *.studiodemont.ch   | 185.101.158.113   | 10800 |

Hinweis: Wildcard `*.studiodemont.ch` zeigt auf andere Hosttech-IP als marcodemont.ch (anderer Webspace).

### AAAA Records (IPv6)
Keine AAAA-Records vorhanden.

### MX Records
| Host            | Mail Exchanger      | TTL  | Praeferenz |
|-----------------|---------------------|------|------------|
| studiodemont.ch | mail1.hosttech.eu   | 3600 | 10         |
| studiodemont.ch | mail2.hosttech.eu   | 3600 | 10         |

### TXT Records
| Host                   | Inhalt                                | TTL   |
|------------------------|---------------------------------------|-------|
| studiodemont.ch        | `v=spf1 +mx +a include:_spf.mail.hostserv.eu ~all` | 10800 |
| _dmarc.studiodemont.ch | `v=DMARC1; p=reject; pct=100`                      | 10800 |

Hinweis: Wert nicht direkt aus dem Hosttech-Panel verifiziert, aber identisch zur marcodemont.ch-Konfiguration (Hosttech-Standard). Bei einer Migration im Panel pruefen.

### Bekannte Subdomains
- *.studiodemont.ch (Wildcard, zeigt auf Hosttech-Webspace)

---

### Migrations-Checkliste (falls Domain spaeter doch zu Cloudflare wandert)

1. [ ] SPF-Record vollstaendig ablesen, in dieser Datei nachtragen.
2. [ ] In Cloudflare die Domain hinzufuegen, Auto-Scan, Records vergleichen.
3. [ ] Fehlende Records nachtragen (besonders TXT).
4. [ ] Nameserver bei Hosttech auf Cloudflare-NS umstellen.
5. [ ] Nach Active: Email-Test.
