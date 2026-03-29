# BUG-FEAT2-UX-020: Keine Bestätigung nach erfolgreicher Preset-/Zeitauswahl

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** UX / Feedback
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Wenn der Moderator einen Preset-Button oder "Übernehmen" klickt, ändert sich die Timer-Anzeige auf den neuen Wert. Das ist visuelles Feedback – aber nur wenn der Moderator aktiv auf die Timer-Anzeige schaut. Wer gerade auf die Buttons blickt (typisch bei schnellem Workshop-Einsatz), sieht keine direkte Rückmeldung am Button selbst, dass die Aktion erfolgreich ausgeführt wurde.

Für Preset-Buttons: Der aktive Preset leuchtet blau auf – das ist ausreichend. Aber beim "Übernehmen"-Button gibt es keinerlei Success-Feedback: kein kurzes Aufleuchten, kein Checkmark, kein "Übernommen".

## Steps to Reproduce

1. Individuelle Zeit eingeben (z.B. 3 Min 30 Sek)
2. "Übernehmen" klicken
3. Expected: Kurzes visuelles Feedback am Button selbst (z.B. grüner Hintergrund für 1s, Checkmark)
4. Actual: Button bleibt optisch unverändert; nur der Timer ändert sich irgendwo weiter oben auf der Seite

## Empfehlung

Analog zu `CopyButton.tsx` einen kurzen Success-Zustand im `CustomTimeInput`-Submit-Button implementieren: Nach erfolgreichem Submit zeigt der Button für ~1s einen grünen Hintergrund oder einen Checkmark. Reset auf Ausgangszustand nach Timeout.

## Priority
Nice-to-have
