# BUG-FEAT2-UX-010: ShareSection-Toggle verliert Fokus beim Schließen

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y / Flow
- **Gefunden von:** UX Reviewer
- **Status:** Fixed
- **Fixed on:** 2026-03-29

## Problem

Das Fokus-Management in `ShareSection.tsx` (Fix für UX-006) behandelt nur den Fall des Öffnens: Wenn die ShareSection geöffnet wird, springt der Fokus korrekt auf den ersten Button. Wenn der User die Section jedoch wieder schließt (Klick auf "Session teilen"), bleibt der Fokus im nun versteckten Bereich. Das `hidden`-Attribut entfernt das Element effektiv aus der Tab-Reihenfolge, d.h. der Fokus fällt auf ein unkontrolliertes Ziel (häufig `<body>`).

## Steps to Reproduce

1. Moderatoren-Ansicht öffnen
2. "Session teilen" klicken → Bereich öffnet sich, Fokus springt korrekt auf "Teilnehmer-Link kopieren"
3. Tab-Navigation fortsetzen bis zu "Session teilen"-Button oder direkt nochmals auf "Session teilen" klicken
4. Section schließt sich
5. Expected: Fokus liegt auf dem "Session teilen"-Toggle-Button
6. Actual: Fokus ist unkontrolliert – landet auf `<body>` oder springt an eine unvorhersehbare Stelle

## Empfehlung

Im `useEffect` in `ShareSection.tsx` zusätzlich den Fall `!isOpen` behandeln: Wenn die Section geschlossen wird, Fokus explizit auf den Toggle-Button (`<button type="button">Session teilen</button>`) zurücksetzen. Dazu einen `toggleRef` auf den Toggle-Button anlegen.

## Priority
Fix before release

**Fix:** ShareSection.tsx – toggleButtonRef ergänzt, beim Schließen Fokus auf Toggle-Button zurückgesetzt.
