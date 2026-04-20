## | AURUM | Version

# AURUM v0.05

Vollbild, Notch-Respekt, Admin-/Praesentationsmodus, Geraete-Reset. Die App geht vom Klickdummy-Rahmen zur ernsten PWA-Form ueber und bekommt einen schlanken Schalter, um Diplomarbeits-Praesentationen sauber zu fuehren.

* Version: v0.05
* Status: gefroren, historische Referenz. Nachfolger: v0.06 (Capacitor).
* Scope: Layout, lokaler Modus-Schalter, Geraete-Reset. Keine neuen Marker-Typen, kein neues Datenmodell.

Gegenueber v0.04 gelten folgende grundlegende Aenderungen:

* **Phone-Bezel entfaellt.** Das Layout fuellt den Viewport vollstaendig.
* **iPhone-Notch wird ueber `env(safe-area-inset-top)` respektiert.**
* **Wochen-Dots nutzen echte Marker-Farbe statt Typ-Farbe.** Fallback auf Typ-Farbe bleibt.
* **Admin-/Praesentationsmodus** als lokaler Schalter pro Geraet, per `localStorage` persistiert. Default: an.
* **„Komplett zuruecksetzen"-Knopf** in den Einstellungen, entfernt Session, Admin-Flag und (vorbereitet fuer v0.07) den Onboarding-Status.

---

## Inhaltsverzeichnis

0. Grundprinzip
1. Vollbild und Notch
2. Wochen-Dots mit echter Marker-Farbe
3. Admin- und Praesentationsmodus
4. Admin-gesteuerte Elemente
5. Geraete-Reset
6. Login-Persistenz
7. Datenfelder und lokale Keys
8. Was bleibt aus v0.04
9. Offene Punkte
10. Kurzfassung

---

## 0. Grundprinzip

AURUM soll am Telefon wie eine App wirken, nicht wie eine Web-Seite im Rahmen. Gleichzeitig muss der Diplomarbeits-Kontext dafuer sorgen, dass beim Zeigen vor Publikum keine Debug- oder Admin-Elemente auftauchen. v0.05 loest beides: sauberes Fullscreen-Verhalten plus einen lokalen Schalter, der Sichtbarkeit steuert.

---

## 1. Vollbild und Notch

* `.phone` hat `width:100%; min-height:100vh`
* Top-Padding respektiert `env(safe-area-inset-top,0)`, Bottom-Padding analog
* `.notch-bar` und `.notch` werden global auf `display:none` gesetzt
* `meta viewport` mit `viewport-fit=cover`

Das greift voll erst, wenn die App ueber den iOS-Homebildschirm gestartet wird („Zum Home-Bildschirm" via Safari-Teilen-Knopf). Im normalen Tab bleibt der Browser-UI-Rand.

---

## 2. Wochen-Dots mit echter Marker-Farbe

`loadWeekSummary()` selektiert jetzt `marker_date, marker_type, color`. `weekSummary[iso]` ist statt eines Sets pro Datum ein Array aus `{type, color}`-Objekten. In `renderWeek()` wird pro Typ (audio, compression, planned) der erste Marker des Tages genommen und seine Farbe verwendet. Fallback auf die Typ-Variable `var(--mt-${t})`, wenn `color` leer ist.

---

## 3. Admin- und Praesentationsmodus

* lokaler Schalter, `localStorage`-Key `aurum_admin_mode`
* Default: `'1'` (Admin-Modus an, wenn der Schluessel nicht existiert)
* JS: `isAdminMode()`, `applyAdminVisibility()`, `onAdminToggle()`
* CSS: `body:not(.admin-mode) .admin-only { display:none !important }`
* Init ruft `applyAdminVisibility()` vor der ersten Render-Operation
* `prepareSettingsScreen()` synchronisiert den Toggle-Zustand

---

## 4. Admin-gesteuerte Elemente

Markup mit Klasse `admin-only` bzw. IDs:

* `#sheet-opt-anchor` | Anker-Option im Marker-Sheet
* `#sheet-opt-compression` | Kompressions-Option
* `.set-section` Armreif | Ring-Pairing
* `.login-footer` | „AURUM . DIPLOMARBEIT . v5 . ..."
* `.set-info` | Versionsangabe in den Einstellungen

Im Praesentationsmodus verschwinden diese Elemente, die Timeline und der Audiomarker-Flow bleiben ungestoert.

---

## 5. Geraete-Reset

Button in den Einstellungen („Komplett zuruecksetzen"). Funktion `resetDeviceState()`:

1. Confirm-Dialog
2. `storage.del('aurum_session')`
3. `localStorage.removeItem('aurum_admin_mode')`
4. `localStorage.removeItem('aurum_onboarded')` (vorbereitet fuer v0.07)
5. In-Memory-State zuruecksetzen (`AUTH`, `userSettings`)
6. `location.reload()`

Daten in Supabase bleiben unberuehrt.

---

## 6. Login-Persistenz

Die Session wird wie in v0.08 historisch ueber `storage.get/set('aurum_session')` gehalten. `loadSession()` wird im Init-Block aufgerufen, vor dem ersten Render. Neu in v0.05: `applyAdminVisibility()` laeuft _vor_ `loadSession()`, damit der Modus den Login-Screen bereits korrekt rendert.

---

## 7. Datenfelder und lokale Keys

Neu lokal:

* `localStorage['aurum_admin_mode']` | `'1'` oder `'0'`
* `localStorage['aurum_onboarded']` | noch nicht aktiv gesetzt, aber reserviert

Kein DB-Schema-Change.

---

## 8. Was bleibt aus v0.04

* Farben fuer geplante Marker
* Wiederholungen als naive Instanz-Kopien
* Anker-Hover und Anker-Detail mit Tagesliste
* Kompressionen bleiben Protokoll-Eintraege

---

## 9. Offene Punkte

* Notch-Verhalten nur auf iPhone via Home-Bildschirm-PWA sichtbar; Test auf Hardware steht noch aus.
* Login-Persistenz ist aus v0.08 uebernommen, Verifikation auf echtem Geraet aussteht.
* „Mobile mit Rahmen" (Demo-Modus am Desktop) und „Desktop Vollbild" koexistieren noch nicht in einer Datei. Ab v0.06 sollen sie zu einem Modus-Schalter zusammengefuehrt werden.

---

## 10. Kurzfassung

v0.05 macht AURUM visuell und organisatorisch erwachsen. Der Rahmen verschwindet, die Notch wird respektiert, die Wochen-Dots werden farblich ehrlich, ein Admin-Modus schuetzt Praesentationen, und ein Geraete-Reset erlaubt sauberes Neu-Oeffnen. Kein neues Datenmodell, keine neuen Marker-Typen.
