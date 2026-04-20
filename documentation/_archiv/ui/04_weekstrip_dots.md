# 04 | Week-Strip mit Marker-Dichte

## 1. Was es ist

Der bereits bestehende Wochenstreifen oben in `s-main` bekommt pro Tag bis zu drei kleine Farbpunkte, die anzeigen, welche Marker-Typen an dem Tag liegen. So wird der Monatsverlauf auf einen Blick lesbar, ohne jeden Tag zu oeffnen.

## 2. Warum uebernehmen

- AURUM hat den Container `wday-dots` bereits angelegt, aber er wird heute nicht gefuellt
- Planwoo zeigt, dass farbige Tages-Mini-Indikatoren gut funktionieren, ohne zu lenken
- passt zur Timeline-Idee: Muster ueber Zeit sichtbar machen, ohne Zahlen oder Scores
- macht die Navigation durch die Woche intuitiver

## 3. Quelle

- Klon: `Planwoo/index.html`
- Element im Klon: `.week-strip` unter `screen-home`
- CSS-Struktur in Planwoo: Mini-Bullets pro Tag, jeweils farbig

In AURUM ist die Struktur im HTML bereits da, nur die Logik fehlt. Dies ist eher eine **Ergaenzung** als eine Uebernahme.

## 4. AURUM-Anpassung

- genau drei Dots maximal pro Tag
- Reihenfolge: Audio, Kompression, Planned (Anker bewusst weggelassen, weil sie oft dominieren wuerden)
- Farben: bestehende Marker-Typ-Farben (`--mt-audio`, `--mt-compression`, `--mt-planned`)
- falls mehr als drei Typen vorhanden: nur die drei sichtbaren zeigen, kein Overflow-Dot
- falls keine Marker: leerer Platz (min-height 8px, wie heute schon)

## 5. Layout-Skizze

```
Mo.    Di.    Mi.    Do.    Fr.    Sa.    So.
14     15     16     17     18     19     20      (Datumszahlen)
·      ··     ···    ·       ··    ·       ·       (Typ-Dots)
```

Details:
- `.wday-dots` container bleibt wie jetzt
- pro Dot: 5x5px, `border-radius:50%`, Farbe aus `--mt-xxx`
- gap 2px zwischen Dots
- flex-wrap erlaubt, max-width durch Layout begrenzt

## 6. Platz im Code

- Funktion `renderWeek()` in `AURUM.html` (aktuell Zeilen 853 ff.) erweitern
- neue Funktion `fetchWeekSummary()`: holt alle Marker der aktuellen Woche aggregiert
  - einmalig beim Aufruf, nicht pro Tag
  - filtert auf `marker_date` between Montag und Sonntag der laufenden Woche
- pro Tag: bestimme, welche der drei relevanten Typen (audio, compression, planned) vorkommen
- fuege pro gefundenem Typ einen `<div class="wdot" style="background:var(--mt-xxx)">` ins `.wday-dots` ein

Optional: Caching, damit beim Tag-Wechsel in der selben Woche nicht neu geladen wird. Nicht Prioritaet im MVP.

## 7. Verhalten und Interaktion

- Dots sind rein dekorativ, kein Klick-Verhalten
- Klick auf Tag bleibt wie heute: selektiert den Tag, laedt Timeline
- Dots aktualisieren sich, wenn in der selben Woche ein neuer Marker gesetzt wird (optimistisches Update oder nach Save neu laden)
- Wochensprung (noch nicht implementiert, aber denkbar): wenn die Week-Navigation spaeter kommt, rendert diese neue Woche mit eigener Aggregation

## 8. Offene Punkte

- Sollen Anker mitgezeigt werden, obwohl sie haeufig vorkommen? Alternative: Anker nur dann als vierter Dot, wenn keiner der anderen drei Typen am Tag existiert.
- Sollen unterschiedliche Anzahlen pro Typ sichtbar sein (z. B. zwei kleine Punkte fuer zwei Audiomarker)? Meine Empfehlung: nein, das fuehrt zurueck zu Zaehl- und Vergleichs-Logik, die AURUM bewusst meidet.
- Soll der heutige Tag optisch zusaetzlich hervorgehoben werden (Gold-Kreis ist schon da)?
