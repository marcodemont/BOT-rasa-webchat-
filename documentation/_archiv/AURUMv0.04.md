## | AURUM | Version

# AURUM v0.04

Erster funktional-inhaltlicher Schritt nach den Designversionen. Zwei neue Marker-Faehigkeiten: geplante Marker mit Farbwahl und Wiederholung, Anker mit Hover-Tooltip und Aufgaben-Liste des Tages.

* Version: v0.04
* Status: gefroren, historische Referenz. Nachfolger: v0.05 (Vollbild + Admin).
* Scope: Feature-Ausbau auf Marker-Ebene. Design und Grundarchitektur bleiben wie in v0.03.

Gegenueber v0.03 gelten folgende grundlegende Aenderungen:

* **Geplante Marker erhalten eine Farbauswahl.** Der Nutzer kann einem zukuenftigen Zeitpunkt eine persoenliche Farbe zuordnen, die in Timeline, Week-Dots und Bubble-Icon durchgezogen wird.
* **Geplante Marker erhalten einfache Wiederholungen.** Einmalig, wochentags, taeglich, woechentlich. Technisch als naive Instanz-Kopie, nicht als verknuepfte Serie.
* **Anker bekommen einen Hover-Tooltip mit Zeit und Ort.**
* **Anker-Detail-Screen zeigt offene geplante Marker des Tages.** Ein Klick verknuepft den Anker mit dem geplanten Marker: der Marker gilt als erledigt, der Anker haelt fest, was erledigt wurde.

---

## Inhaltsverzeichnis

0. Grundprinzip
1. Geplante Marker mit Farbwahl
2. Geplante Marker mit Wiederholung
3. Anker als aktive Erfassungsform
4. Verhaeltnis Anker und geplanter Marker
5. Datenfelder
6. Bekannte Einschraenkungen
7. Was bleibt aus v0.03
8. Kurzfassung

---

## 0. Grundprinzip

v0.04 erkennt an, dass die Timeline mehr sein muss als eine Chronologie. Zwei Interaktionsformen bekommen eigene Substanz: der Anker als rueckblickendes Werkzeug und der geplante Marker als vorwaertsgerichteter Platzhalter. Die Bruecke zwischen beiden wird bewusst simpel gebaut, damit sie im Moment nicht stoert.

---

## 1. Geplante Marker mit Farbwahl

Beim Anlegen eines geplanten Markers waehlt der Nutzer aus einer kuratierten Palette eine Farbe. Die Farbe erscheint:

* als Bubble-Hintergrund in der Timeline
* als Rand bzw. gefuellter Kreis im Erledigt-Toggle
* spaeter (v0.05) als Marker-spezifischer Dot im Wochenstreifen

---

## 2. Geplante Marker mit Wiederholung

Vier Wiederholungstypen:

* **einmalig** | Standard
* **wochentags** | Mo bis Fr
* **taeglich** | jeden Tag
* **woechentlich** | gleicher Wochentag

Technisch werden Wiederholungen als **naive Instanz-Kopien** angelegt: pro Faelligkeitsdatum eine eigene Zeile. Verknuepfungen zwischen Instanzen gibt es nicht; eine Serie laesst sich nicht global bearbeiten. Das ist bewusst einfach gehalten und wird in spaeteren Versionen offen reevaluiert.

---

## 3. Anker als aktive Erfassungsform

Der Anker bleibt auf der Timeline minimal (Punkt plus Label), bekommt aber:

* Hover-Tooltip mit Zeit und Ort
* Detail-Screen mit der Liste der offenen geplanten Marker desselben Tages

---

## 4. Verhaeltnis Anker und geplanter Marker

Klickt der Nutzer im Anker-Detail auf einen offenen geplanten Marker:

* der geplante Marker wird als erledigt markiert
* das Sub-Feld des Ankers bekommt einen Text-Eintrag („erledigt: [Titel des geplanten Markers]")
* die Verknuepfung ist textbasiert, nicht relational. Wird der Titel des geplanten Markers spaeter geaendert, zieht das nicht mit.

Bewusste Einfachheit. Saubere Relationen waeren Overkill fuer den aktuellen Stand.

---

## 5. Datenfelder

Neu:

* `markers.color` | Hex-String bei geplanten Markern, sonst leer
* `markers.repeat_type` | `once | weekdays | daily | weekly`
* `markers.repeat_parent_id` | nur informativ, zeigt die Instanz-Quelle

Bestehend weiter genutzt:

* `markers.is_done`
* `markers.sub` (Anker-Text)

---

## 6. Bekannte Einschraenkungen

* Wiederholungen ohne Serien-Logik. Eine Aenderung bleibt lokal bei der einzelnen Instanz.
* Anker-Verknuepfung zu geplantem Marker lebt im Text-Feld, nicht als Relation.
* Kompressionen bleiben Protokoll-Eintraege, weil die Ring-Kopplung (v0.10) noch fehlt.

---

## 7. Was bleibt aus v0.03

* Pastell-Cream-Farbwelt
* Bottom-Nav mit Timeline, Notizen, Einstellungen
* Supabase-Auth
* Marker-Detail-Screen und Notizen-Ebene aus v0.08 (historisch gewachsen im alten Changelog)

---

## 8. Kurzfassung

v0.04 gibt geplanten Markern Farbe und einfache Wiederholungen und macht Anker zur aktiven Erfassungsform mit Bezug zum Tagesplan. Die Datenmodellierung bleibt bewusst naiv: keine Serien, keine Relationen. Alles, was komplexer werden muesste, wird auf spaeter verschoben.
