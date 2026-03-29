# BUG-FEAT2-UX-014: "Warten auf nächsten Timer" erscheint auch im Paused-Zustand aus Teilnehmersicht

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** UX / Copy
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Nach einem Reset landet der Timer im `idle`-Zustand, und `ParticipantView.tsx` zeigt korrekt "Warten auf nächsten Timer…". Allerdings ist der Paused-Zustand für Teilnehmer visuell nicht von Idle zu unterscheiden (beide zeigen nur den Timer ohne erklärenden Text). Wenn der Moderator einen Timer pausiert, sieht der Teilnehmer einen eingefrorenen Timer ohne jeden Kontext – ist der Timer kaputt? Wurde der Workshop unterbrochen?

Die aktuelle Logik prüft nur `status === 'idle'`, aber `status === 'paused'` hat ebenfalls keinen Hinweistext.

## Steps to Reproduce

1. Als Teilnehmer beobachten, Moderator pausiert Timer während er läuft
2. Expected: Teilnehmer sieht einen kurzen Status wie "Timer pausiert" unter der Anzeige
3. Actual: Eingefrorene Zeitanzeige ohne jede Erklärung – der Teilnehmer kann den Zustand nicht einordnen

## Empfehlung

In `ParticipantView.tsx` einen weiteren Hinweistext für `status === 'paused'` ergänzen:
```
{status === 'paused' && (
  <p aria-live="polite" ...>Timer pausiert.</p>
)}
```
Damit haben Teilnehmer für alle vier Timer-Zustände eine textuelle Orientierung.

## Priority
Nice-to-have
