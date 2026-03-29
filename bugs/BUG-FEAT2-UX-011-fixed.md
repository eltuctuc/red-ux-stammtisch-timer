# BUG-FEAT2-UX-011: "Übernehmen"-Button im CustomTimeInput hat kein aria-label

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Fixed
- **Fixed on:** 2026-03-29

## Problem

Der Submit-Button in `CustomTimeInput.tsx` trägt nur den sichtbaren Text "Übernehmen" ohne `aria-label`. Im Kontext der Seite ist unklar, was übernommen wird – der Screenreader liest "Übernehmen, Button". Da der Button keine Kontextzuordnung zur Timebox-Eingabe hat, fehlt die Verbindung zwischen Aktion und Zweck. Zusätzlich fehlt dem Button eine `aria-describedby`-Verknüpfung zur Fehlermeldung, obwohl die Fehlermeldung semantisch zu dieser Eingabegruppe gehört.

## Steps to Reproduce

1. Moderatoren-Ansicht mit Screenreader öffnen
2. Tab bis zum "Übernehmen"-Button navigieren
3. Expected: Screenreader liest "Individuelle Zeit übernehmen, Button" oder ähnlich kontextuellen Text
4. Actual: Screenreader liest nur "Übernehmen, Button" – kein Bezug zur Timebox-Funktion

## Empfehlung

`aria-label="Individuelle Zeit übernehmen"` oder `aria-label="Zeit übernehmen"` auf dem Submit-Button ergänzen. Alternativ den sichtbaren Buttontext auf "Zeit übernehmen" ändern – dann ist kein separates `aria-label` nötig.

## Priority
Fix before release

**Fix:** CustomTimeInput.tsx – aria-label='Individuelle Zeit übernehmen' auf Submit-Button ergänzt.
