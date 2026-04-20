# 02 | Onboarding nach Signup

## 1. Was es ist

Ein kurzer, gefuehrter Wizard, der neu registrierte Nutzer einmalig durchlaeuft. Er stellt AURUM vor (kurz), erklaert die vier Marker-Typen (minimal), prueft Mikrofon- und Standort-Berechtigungen (nur wenn angefragt, keine Push) und fuehrt danach auf die Timeline.

## 2. Warum uebernehmen

- AURUM hat heute kein Onboarding. Nach Signup landet der Nutzer direkt auf der leeren Timeline, ohne Kontext.
- die Marker-Typen (Anker, Audiomarker, Kompression, Geplant) sind ungewoehnlich und brauchen eine kurze Einfuehrung.
- der Ring (v0.10) wird spaeter zusaetzliche Onboarding-Schritte fuer Bluetooth-Pairing brauchen. Die gleiche Wizard-Form kann dann wiederverwendet werden.

## 3. Quelle

- Klon: `me+/index.html`
- Screen-IDs im Klon: `screen-welcome`, `screen-benefits`, `screen-planning`
- CSS-Klassen: `.onb-top` (Dots plus Skip), `.progress`, `.main-btn`, `.setup-topbar` (Back, Progress, Skip)

Uebernommen wird die **Form** (Wizard, Fortschrittsbalken, Skip, eine Entscheidung pro Screen, grosser Capsule-CTA). Inhalt und Sprache sind AURUM-eigen.

## 4. AURUM-Anpassung

Keine Illustrationen mit Papier, Kaffee oder Stift. Keine motivationale Sprache. Stattdessen:

- kurze Sachtexte
- ein Icon pro Screen, einfarbig, passend zum Marker-Typ
- Akzent Gold
- Skip bleibt als Option rechts oben, jederzeit zur Timeline

## 5. Screen-Folge (Vorschlag)

| # | Screen-ID | Frage/Inhalt | CTA | Skip |
|---|---|---|---|---|
| 1 | `s-onb-welcome` | „Willkommen bei AURUM" plus ein Satz: „Ein ruhiger Ort fuer Momente, Gedanken und Pausen." | Weiter | Skip |
| 2 | `s-onb-markers` | Vier Marker-Typen in einer Liste, je ein Icon plus ein Satz | Weiter | Skip |
| 3 | `s-onb-ring` | „Der Armreif kommt spaeter. Heute setzt du Marker ueber das Plus-Symbol." Bild oder Skizze. | Weiter | Skip |
| 4 | `s-onb-perms` | Mikrofon- und Standort-Hinweis (nicht anfragen, nur erklaeren dass es beim ersten Gebrauch kommt). Keine Push-Permission. | Verstanden | — |

Kein Screen zu Statistiken, Trophies oder Abonnement. Nach Screen 4 geht es auf `s-main`.

## 6. Layout-Skizze (Screen 2 als Beispiel)

```
┌─────────────────────────────────┐
│  ‹       ●───●────         ···  │   Topbar mit Dots oder Progress, Skip
│                                 │
│  Vier Arten,                    │
│  einen Moment zu halten.        │   Heading
│                                 │
│  ┌─────────────────────────┐    │
│  │ ● Anker                 │    │   Listenreihe 1
│  │   Ein Zeitpunkt ohne    │    │
│  │   Inhalt. Schnell.      │    │
│  ├─────────────────────────┤    │
│  │ ● Audiomarker           │    │   Listenreihe 2
│  │   Zeitpunkt plus Audio. │    │
│  │   Inhalt landet in      │    │
│  │   einer Notiz.          │    │
│  ├─────────────────────────┤    │
│  │ ● Kompression           │    │   Listenreihe 3
│  │   Koerperliche Antwort  │    │
│  │   ueber den Armreif.    │    │
│  ├─────────────────────────┤    │
│  │ ● Geplanter Marker      │    │   Listenreihe 4
│  │   Zukuenftiger Zeitpunkt│    │
│  │   mit haptischer        │    │
│  │   Erinnerung.           │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │       Weiter            │    │   CTA Capsule Gold
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

Die farbigen Punkte am Zeilenanfang nutzen die bestehenden Marker-Typ-Farben `--mt-anchor`, `--mt-audio`, `--mt-compression`, `--mt-planned`.

## 7. Platz im Code

- vier neue Screens in `AURUM.html`: `s-onb-welcome`, `s-onb-markers`, `s-onb-ring`, `s-onb-perms`
- neue CSS-Sektion `/* ═══ ONBOARDING ═══ */`
- JS: State in `localStorage` (`aurum_onboarded = "1"`), beim ersten Login nach Signup Weiterleitung auf Screen 1 statt `s-main`
- Skip fuehrt direkt auf `s-main` und setzt `aurum_onboarded`

## 8. Verhalten und Interaktion

- Back-Pfeil oben links funktioniert nur ab Screen 2
- Skip rechts oben jederzeit verfuegbar
- Progress-Indicator oben Mitte (drei oder vier Punkte)
- Wiedereintritt: wenn Nutzer abbricht und spaeter wiederkommt, zeigt AURUM das Onboarding nicht nochmal, es sei denn in den Einstellungen gibt es einen „Einfuehrung erneut zeigen"-Link
- kein Auto-Play, kein erzwungenes Lesen, keine Validierung von Interaktionen
- Screen 4 ruft aktiv **keine** System-Permissions ab. Die Permissions kommen erst beim ersten echten Gebrauch (Aufnahme oder Anker mit Geo).

## 9. Offene Punkte

- Soll es einen Einstiegs-Hinweis „Du bist eingeloggt als xxx@yyy" geben oder bleibt das implizit?
- Moechtest du einen Screen zur ruhigen Erklaerung der somatischen Idee (Armreif reagiert koerperlich statt visuell), oder ist das spaeter bei Ring-Pairing besser aufgehoben?
- Soll der Fortschritts-Indicator als Dots oder als kontinuierlicher Balken erscheinen?
