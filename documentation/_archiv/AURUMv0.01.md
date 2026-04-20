## | AURUM | Version

# AURUM v0.01

Ausgangspunkt. Klickdummy einer Tagesplaner-App im Structured-Stil als Gruendungspunkt der Diplomarbeit.

* Version: v0.01
* Status: gefroren, historische Referenz. Codestand nicht mehr erhalten, ausschliesslich durch diese Doku nachvollziehbar.
* Scope: visuelles Konzept, keine Datenpersistenz, kein Backend.

---

## Inhaltsverzeichnis

0. Grundprinzip
1. Funktionsumfang
2. Architektur
3. Verhaeltnis zu v0.02
4. Was bewusst nicht Teil war
5. Kurzfassung

---

## 0. Grundprinzip

AURUM startet als reine Interaktions-Skizze. Das Ziel ist nicht Funktion, sondern das Gefuehl, mit Zeit und Zustaenden umzugehen. Der Klickdummy legt fest, wie sich die Navigation anfuehlen soll, bevor eine Zeile Persistenzcode existiert.

---

## 1. Funktionsumfang

* fuenf Screens (Timeline, Aufgabe anlegen, Notiz, Einstellungen, Login-Dummy)
* statisches Beispiel-Datenarray im Code
* Klicken auf Elemente ruft nur UI-Wechsel aus
* keine Datenbank, kein Login, keine Speicherung

---

## 2. Architektur

* **Frontend:** eine einzige HTML-Datei, Vanilla JavaScript, kein Framework
* **Styling:** dunkles Theme, Coral-Akzent (Structured-Inspiration)
* **Backend:** nicht vorhanden

---

## 3. Verhaeltnis zu v0.02

v0.01 dient als Gefuehls-Referenz. v0.02 loest es visuell vollstaendig ab und behaelt nur die Interaktionsstruktur. Alles am dunklen Theme und am Coral-Akzent wird in v0.02 neu gedacht.

---

## 4. Was bewusst nicht Teil war

* keine Datenspeicherung
* keine Authentifizierung
* keine Begriffsabgrenzung (Anker, Audiomarker usw. kommen erst ab v0.06)
* keine Verbindung zu Armreif oder KI

---

## 5. Kurzfassung

v0.01 ist ein Klickdummy mit dunklem Theme, fuenf Screens und Coral-Akzent. Einziger Zweck: die Interaktionsform festlegen, auf der alle spaeteren Versionen aufbauen.
