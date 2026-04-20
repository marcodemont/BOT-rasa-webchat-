## | AURUM | Version

# AURUM v0.06

Capacitor-Integration. AURUM wird ab dieser Version nicht mehr nur als Progressive Web App ausgeliefert, sondern zusaetzlich als nativer iOS- und Android-Container. Damit wird der Armreif ueber Bluetooth LE erreichbar, und Geolocation, Preferences und Filesystem laufen ueber native iOS-/Android-APIs statt ueber Browser-Polyfills.

* Version: v0.06
* Status: aktiv. Laufender Stand der Entwicklung. Nachfolger offen (v0.07 vorgesehen fuer Onboarding + mobile/desktop-Modus-Split in einer Datei).
* Scope: native Schicht, neue Plugin-Abhaengigkeiten, Verzeichnis-Reorganisation des ganzen Repos. Keine neuen Marker-Typen, kein neues DB-Schema.

Gegenueber v0.05 gelten folgende grundlegende Aenderungen:

* **Capacitor als native Schicht** mit Plugin-Vollset: Core, CLI, iOS, Android, Bluetooth LE, Geolocation, Preferences, Filesystem.
* **`webDir` zeigt auf `../app/`**, also auf denselben Ordner wie die PWA. Kein doppelter Code.
* **Repo-Struktur ab Root neu organisiert.** Alles Relevante liegt direkt oder in einem sinnvollen Unterordner auf der Root-Ebene. Die frueheren Zwischenordner (`.AURUM-neu/.AURUM/`) sind aufgeloest.
* **Versionierung sichtbar, nicht versteckt.** HTML-Dateiversionen (`AURUMv4.html`, `AURUMv5.html`) entfallen als Parallelkopien. Es existiert eine einzige `app/AURUM.html`, die in-place upgegradet wird. Pro Version gibt es nur noch die Doku (`AURUMv0.XX.md`).
* **Ein Starter, kein Versions-Suffix.** Statt `AURUMv0.XX.bat` pro Version existiert nur noch `AURUM.bat` auf der Root. Sie startet den aktuellen Stand auf Port 8006 und zeigt zusaetzlich die WLAN-IPs fuer iPhone-/iPad-Zugriff an. Versions-Differenzen sind ausschliesslich in den `documentation/AURUMv0.XX.md` festgehalten, nicht im Dateisystem.

---

## Inhaltsverzeichnis

0. Grundprinzip
1. Warum Capacitor
2. Plugin-Set (Vollset)
3. Verzeichnisstruktur
4. Versionierungs-Konzept
5. Web-Code und native Schicht
6. BLE-Vertrag zum Armreif
7. Preferences statt localStorage (Plan)
8. Filesystem statt Browser-Download (Plan)
9. Geolocation-Plugin statt navigator.geolocation (Plan)
10. Windows-Entwicklung, macOS-Pflicht fuer iOS
11. Datenfelder und lokale Keys
12. Was bleibt aus v0.05
13. Bewusst nicht Teil von v0.06
14. Offene Punkte
15. Kritische Regeln
16. Begriffsglossar
17. Kurzfassung

---

## 0. Grundprinzip

AURUM hat ein physisches Gegenstueck (den Armreif). Solange die App nur im Safari laeuft, kann sie das Gegenstueck nicht erreichen. Capacitor bricht diese Grenze, ohne den Web-Code zu duplizieren: derselbe `app/`-Ordner wird in Xcode und Android Studio als WebView-Shell geladen und erhaelt Zugriff auf native APIs ueber Plugins. Die Weiterentwicklung passiert weiterhin an einer Stelle.

---

## 1. Warum Capacitor

* Web Bluetooth wird in iOS Safari nicht unterstuetzt. BLE zum Armreif braucht ein natives Plugin.
* Vollbild und Notch-Behandlung sind in einer nativen Shell sauberer als in einer installierten PWA.
* Session-Persistenz und Datei-Zugriff sind nativ stabiler als im Browser.
* Ein vorhandener Web-Code bleibt unveraendert nutzbar. Keine Umstellung auf React Native oder Flutter.

---

## 2. Plugin-Set (Vollset)

Declared in `mobile/package.json`:

```
@capacitor/core                    | Basis-API
@capacitor/cli                     | Dev-Tools
@capacitor/ios                     | iOS-Plattform
@capacitor/android                 | Android-Plattform
@capacitor-community/bluetooth-le  | Armreif-Kopplung
@capacitor/geolocation             | Ort am Anker, sauberer iOS-Permission-Flow
@capacitor/preferences             | Session- und Flag-Persistenz
@capacitor/filesystem              | Audio-Ablage, Import/Export
```

Entscheidung fuer Vollset statt Minimalset, weil Ring-Hardware, Audiodatei-Handling und Onboarding (v0.07) alle Plugins zwingend erfordern. Ein spaeteres Nachruesten waere teurer.

---

## 3. Verzeichnisstruktur

```
Clone/                                  (wird zu AURUM - claude/ umbenannt)
|
+-- app/                                 einziger Web-Code
|   +-- AURUM.html                       die App in einer Datei
|   +-- icons/
|   +-- manifest.webmanifest
|   +-- sw.js                            Service Worker (derzeit deaktiviert)
|
+-- mobile/                              Capacitor-Schicht
|   +-- package.json
|   +-- capacitor.config.ts              webDir: "../app"
|   +-- README.md
|   +-- ios/                             (wird per `cap add ios` erzeugt, braucht Mac)
|   +-- android/                         (wird per `cap add android` erzeugt)
|
+-- supabase/                            Migrationen, Schema, Config
+-- documentation/                       Konzept, Changelog, UI-Analyse
+-- dokumente/                           Diplomarbeit-PDFs
+-- informationen/                       Prototypen, Skizzen, Screenshots
+-- _referenzen/                         me+, Planwoo, Struktured (UI-Vorlagen)
+-- _archiv/                             historische Stand-Kopien
|
+-- AURUMv0.01.md ... AURUMv0.06.md      Versions-Doku (diese Familie)
+-- AURUM.bat                            einziger Starter (Port 8006, zeigt WLAN-IPs fuer iPhone-Zugriff)
|
+-- README.md
+-- .env, .env.example, .gitignore
+-- API-Keys.md                          private Keys (nicht commiten)
+-- server.js                            optional, Node-basierter Alternativserver
```

Entfallen gegenueber v0.05:

* `.AURUM-neu/` und alle Zwischenordner
* `.AURUM (desktop).bat`, `.AURUM (mobile).bat`, `.AURUMv1.bat`, `.AURUMv2.bat` und `AURUMv2.bat ... AURUMv5.bat` (historische Starter mit toten Pfaden)
* Parallele HTML-Versionen `AURUMv2.html ... AURUMv5.html` in `app/`
* Root-Duplikate von `icons/`, `manifest.webmanifest`, `sw.js` (liegen jetzt ausschliesslich in `app/`)
* ROMY-Referenz-Konzepte (`CONCEPT-V1.md` bis `V3.md`) aus `documentation/`. ROMY ist getrenntes Projekt.

---

## 4. Versionierungs-Konzept

* Eine App, nicht mehrere Parallelkopien.
* Pro Version: **nur** eine MD (Doku, was sich aendert). Kein eigener Starter, kein eigener HTML-Fork.
* Es existiert genau **ein** Starter: `AURUM.bat` auf der Root. Sie startet immer den aktuellen Stand aus `app/AURUM.html` auf Port 8006.
* Der Code im `app/`-Ordner wird in-place aufgewertet. Historische Code-Staende liegen in `_archiv/`.
* Neue Versionsnummer, wenn ein abgegrenzter Aenderungsblock dokumentiert werden soll. Nicht pro Commit.

Das loest das zuvor schwebende Problem, dass jede Version einen eigenen HTML-Fork produzierte und jedes Bugfix doppelt oder dreifach passieren musste. Gleichzeitig verhindert es, dass alte Versions-Bats auf zwischenzeitlich geloeschte Backup-Pfade zeigen (Bug aus v0.05 → v0.06).

---

## 5. Web-Code und native Schicht

* Web-Code bleibt HTML + Vanilla JS + CSS in `app/AURUM.html`.
* Capacitor laedt `app/AURUM.html` in eine WKWebView (iOS) bzw. WebView (Android).
* JavaScript im Web-Code prueft `window.Capacitor?.isNativePlatform`, um zu entscheiden, ob Plugin-APIs oder Browser-APIs verwendet werden. Eine duenne Bruecke im Web-Code.

Beispielbruecke fuer Preferences (vorgesehen, nicht fuer v0.06 zwingend implementiert):

```js
const isNative = typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();
const native = isNative ? window.Capacitor.Plugins.Preferences : null;
const storage = {
  async get(key) {
    if (native) return (await native.get({ key })).value;
    return localStorage.getItem(key);
  },
  async set(key, value) {
    if (native) return native.set({ key, value });
    localStorage.setItem(key, value);
  },
  async del(key) {
    if (native) return native.remove({ key });
    localStorage.removeItem(key);
  }
};
```

Der bestehende `storage`-Wrapper aus v0.08 bekommt diesen Zweig.

---

## 6. BLE-Vertrag zum Armreif

Erwartete UUIDs (Default, anpassbar in Einstellungen):

* Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
* Notify Characteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
* Write Characteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`

Was die App vom Armreif erwartet:

* Button 1 | Druckknopf. 1x kurz -> Anker, 2x kurz -> Audiomarker (Aufnahme startet in der App).
* Button 2 | Hebel mit Rueckstellung. Hebelkurve plus Loslassen als Events. Schnell hochgedrueckt = sofort voller Druck, langsam hochgedrueckt = proportional.
* Zeitstempel pro Event.

Konkrete Events und ihre App-Wirkung sind unveraendert gegenueber Konzept v2 Paragraph 4 und 8.

---

## 7. Preferences statt localStorage (Plan)

In v0.06 wird die Umstellung vorbereitet, nicht erzwungen.

* Ziel-Keys: `aurum_session`, `aurum_admin_mode`, spaeter `aurum_onboarded`
* Fallback auf `localStorage` im reinen Web-Modus
* Migration beim ersten nativen Start: alte `localStorage`-Werte ins Preferences-Plugin umziehen

Umsetzung je nach Zeitplan v0.06.x oder v0.07.

---

## 8. Filesystem statt Browser-Download (Plan)

Audiodateien werden weiterhin nach Supabase Storage hochgeladen. Zusaetzlich soll `@capacitor/filesystem`:

* Audio-Export lokal auf das Geraet erlauben
* Transkript-Export als `.txt` oder `.md`
* spaeter: Import bestehender `.m4a`-Dateien, falls der Armreif Offline-Speicher bekommt

Umsetzung nachgelagert.

---

## 9. Geolocation-Plugin statt navigator.geolocation (Plan)

Das native Plugin hat sauberere Permission-Strings und funktioniert im Capacitor-Kontext ohne HTTPS-Voraussetzung. Der bestehende Geo-Call in der App bekommt einen kleinen Switch: auf nativer Plattform Plugin, im Browser `navigator.geolocation`.

---

## 10. Windows-Entwicklung, macOS-Pflicht fuer iOS

* **Auf Windows** geht: `npm install`, `cap init`, `cap add android`, `cap sync`, `cap run android` (wenn Android Studio plus Geraet oder Emulator da ist). Web-Seite weiter im Browser ueber `AURUMv0.06.bat` testbar.
* **Fuer iOS** zwingend: macOS mit Xcode und CocoaPods. `cap add ios`, `cap open ios`, Build und Deployment auf iPhone.
* Entwicklungsrechner ist Windows; iOS-Bauschritte passieren entweder auf gemietetem Mac (MacinCloud, MacStadium) oder ueber Freund/Hardware-Kauf.

---

## 11. Datenfelder und lokale Keys

Kein DB-Schema-Change in v0.06. Native Preferences-Migration fuer bestehende Keys vorbereitet:

* `aurum_session`
* `aurum_admin_mode`
* `aurum_onboarded` (reserviert)

---

## 12. Was bleibt aus v0.05

* Vollbild und Notch-Respekt
* Admin- und Praesentationsmodus
* Geraete-Reset
* Wochen-Dots mit echter Marker-Farbe
* gesamter bestehender Marker- und Notizen-Flow

---

## 13. Bewusst nicht Teil von v0.06

* Onboarding (kommt in v0.07)
* `mobile`/`desktop`-Modus-Schalter in einer Datei (kommt in v0.07)
* Reverse-Geocoding, Wochen- und Monatsuebersicht
* Summary, Auto-Tags, Chat mit AURA
* Stimmungs-/Zustandserkennung aus Audio

---

## 14. Offene Punkte

* iOS-Build-Flow noch unerprobt, weil kein Mac vor Ort
* `Preferences`-Migration fuer bestehende `localStorage`-Keys noch nicht implementiert, nur geplant
* Filesystem-Export nicht implementiert
* BLE-Plugin-Integration in den Web-Code (Event-Listener, Pairing-UI) steht aus

---

## 15. Kritische Regeln

1. **Eine App, ein Code-Ort.** `app/AURUM.html` ist der einzige Web-Code. Keine Parallel-HTMLs pro Version.
2. **Capacitor duplicates nichts.** `webDir: "../app"` ist fix. Keine Kopie in `mobile/www/`.
3. **Versionsartefakte sind Doku und Starter, nicht Code.** Aeltere `AURUMv0.XX.bat`-Dateien oeffnen den aktuellen Stand.
4. **Kein API-Key im Web-Code.** `API-Keys.md` ist privat, `.env` ist in `.gitignore`.
5. **Kein Push-Notification-Plugin.** AURUM bleibt bei der Konzeptregel: keine Push, haptische Rueckmeldung ausschliesslich ueber den Armreif.
6. **`_archiv/` ist Historie, kein Arbeitsbereich.** Kein Edit dort.
7. **Referenz-Klone in `_referenzen/` sind Lesestoff, nicht Abhaengigkeiten.** Die App importiert nichts daraus.

---

## 16. Begriffsglossar

**Capacitor** | Open-Source-Framework (Ionic), das Web-Code in eine native Shell wrappt und Zugriff auf native APIs ueber Plugins bietet.

**webDir** | Verzeichnis, das Capacitor beim Sync in die native Shell kopiert. In AURUM per Config auf `../app` gesetzt, damit kein Duplikat entsteht.

**Plugin** | JavaScript-zu-Native-Bruecke. Jedes hat eine Web-Implementierung als Fallback.

**WKWebView / WebView** | Die native Browser-Komponente, die Capacitor in iOS bzw. Android anzeigt.

**Preferences** | Capacitor-Plugin, das Key-Value-Paare nativ speichert. Ersatz fuer `localStorage`.

**BLE / Bluetooth LE** | Low-Energy-Variante von Bluetooth, Standard fuer Wearables. AURUM kommuniziert so mit dem Armreif.

**Starter-Bat** | `AURUMv0.XX.bat` auf Root. Startet einen lokalen Python-Server auf einem Versions-Port und oeffnet `app/AURUM.html` im Browser.

**Vollset** | Entscheidung, BLE + Geo + Preferences + Filesystem gleichzeitig zu integrieren, statt schrittweise.

---

## 17. Kurzfassung

v0.06 legt die native Schicht unter AURUM. Capacitor wrappt den existierenden Web-Code, das Plugin-Vollset macht Armreif, Ort, Sessions und Dateien nativ erreichbar. Das Repo wird gleichzeitig aufgeraeumt: eine App, eine Code-Datei, pro Version nur eine MD und eine BAT. Historische Bezeichnungen, Duplikat-Assets und Zwischenordner sind weg. AURUM ist ab v0.06 bereit, echte iPhone- und Android-Hardware anzusprechen, sobald ein macOS-Build-Schritt dazukommt.
