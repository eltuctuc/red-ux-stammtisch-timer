# FEAT-2: Timer

## Status
Aktueller Schritt: Spec

## Abhängigkeiten
- Benötigt: FEAT-1 (Session Management) – Timer läuft innerhalb einer Session

---

## 1. Feature Spec
*Ausgefüllt von: /requirements — 2026-03-27*

### Beschreibung
Der Moderator wählt eine Timebox-Dauer (Preset oder individuelle Eingabe) und startet
den Countdown. Alle Teilnehmer in der Session sehen denselben Timer in Echtzeit.
Der Timer durchläuft drei visuelle Zustände (running, warning, expired). Bei Ablauf
ertönt ein sanfter Sound bei allen Clients. Der Moderator kann den Timer jederzeit
pausieren, fortsetzen oder zurücksetzen.

### Definitionen
- **Timebox:** Eine festgelegte Zeitspanne für eine Workshop-Aktivität, definiert durch
  Moderator-Auswahl.
- **Timer-Zustand "running":** Timer läuft, verbleibende Zeit > 20% der Gesamtdauer.
- **Timer-Zustand "warning":** Timer läuft, verbleibende Zeit ≤ 20% der Gesamtdauer.
- **Timer-Zustand "expired":** Countdown hat 00:00 erreicht, Sound wurde abgespielt.
- **Preset:** Eine vordefinierte Timebox-Dauer (2, 5, 10, 15, 30 Minuten),
  per Klick auswählbar.
- **Echtzeit-Sync:** Alle verbundenen Clients einer Session sehen denselben
  Timer-State mit maximal ~1 Sekunde Versatz.

### User Stories
- Als Moderator möchte ich ein Preset (2, 5, 10, 15, 30 Min) per Klick auswählen,
  um ohne Tipp-Aufwand die häufigsten Timeboxen zu starten.
- Als Moderator möchte ich eine individuelle Zeit eingeben, um flexible
  Timeboxen für ungewöhnliche Dauern zu ermöglichen.
- Als Moderator möchte ich den Timer starten, pausieren und fortsetzen, um
  auf spontane Workshop-Situationen reagieren zu können.
- Als Moderator möchte ich den Timer zurücksetzen, um ihn auf die ursprünglich
  gewählte Dauer zurückzubringen und neu zu starten.
- Als Teilnehmer möchte ich den aktuellen Timer-Stand in Echtzeit sehen, um
  ohne eigene Uhr den Zeitdruck der Timebox zu spüren.
- Als Teilnehmer möchte ich durch einen Sound informiert werden wenn die Zeit
  abgelaufen ist, auch wenn ich nicht auf den Bildschirm schaue.

### Acceptance Criteria
- [ ] Die Moderatoren-Ansicht zeigt fünf Preset-Buttons: 2, 5, 10, 15, 30 Min
- [ ] Die Moderatoren-Ansicht enthält ein Eingabefeld für individuelle Zeiteingabe
      (Minuten und Sekunden, nur positive ganzzahlige Werte)
- [ ] Nach Auswahl einer Dauer (Preset oder individuell) wird die Zeit im Timer
      angezeigt, aber der Timer startet nicht automatisch
- [ ] Der Moderator kann den Timer starten; ab diesem Moment läuft der Countdown
- [ ] Der Moderator kann den laufenden Timer pausieren und wieder fortsetzen
- [ ] Der Moderator kann den Timer zurücksetzen auf die ursprünglich gewählte Dauer
- [ ] Bei ≤ 20% verbleibender Zeit wechselt der Timer-Hintergrund von
      `--timer-bg-running` zu `--timer-bg-warning` und die Schriftfarbe
      zu `--timer-text-warning`
- [ ] Bei 00:00 wechselt der Timer in den Zustand "expired"
      (`--timer-bg-expired` / `--timer-text-expired`)
- [ ] Bei Ablauf (00:00) wird für alle verbundenen Clients ein sanfter Sound abgespielt
- [ ] Alle Teilnehmer einer Session sehen denselben Timer-Stand mit max. ~1 Sek. Versatz
- [ ] Teilnehmer sehen keine Steuerungselemente (keine Buttons für Start/Pause/Reset)
- [ ] Der Timer zeigt die verbleibende Zeit im Format `MM:SS`

### Edge Cases
- **Tab war im Hintergrund (Browser-Throttling):** Nach Rückkehr in den Vordergrund
  synchronisiert der Client den aktuellen Stand vom Server – kein lokales Timer-Drift
- **Moderator setzt Timer zurück während Teilnehmer zuschauen:** Alle Clients
  synchronisieren sofort auf die neue Ausgangszeit
- **Teilnehmer tritt Session bei während Timer läuft:** Erhält sofort den
  aktuellen Stand, kein Warten auf nächsten Tick
- **Individuelle Zeiteingabe = 0:** Nicht erlaubt; Eingabe wird nicht akzeptiert,
  Fehlermeldung "Mindestens 1 Sekunde"
- **Individuelle Zeiteingabe > 99 Minuten:** Nicht erlaubt; maximale Dauer ist 99:59
- **Sound kann nicht abgespielt werden (Browser-Policy):** Timer läuft korrekt weiter,
  visueller expired-Zustand wird trotzdem angezeigt; kein Fehler für den Nutzer
- **Netzwerkunterbrechung während laufendem Timer:** Timer läuft clientseitig weiter
  (lokal); nach Reconnect erfolgt Synchronisation mit Server-Stand

### Nicht im Scope
- Mehrere gleichzeitige Timer in einer Session
- Sequenz-Timer (mehrere Timeboxen hintereinander)
- Eigene Sound-Auswahl durch den Moderator
- Timer-Verlauf oder Historie
