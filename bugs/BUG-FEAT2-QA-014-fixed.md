# BUG-FEAT2-QA-014: isWarning-Flash beim "Nochmal starten" aus expired-Zustand

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed – 2026-03-29
- **Fix:** `displayRemainingMs > 0` Guard in `isWarning`-Berechnung in `useTimerSession.ts` ergänzt. Verhindert false-positive Warning-Frame beim expired→running Übergang, da `displayRemainingMs` erst im nächsten rAF-Frame auf den korrekten Wert aktualisiert wird.

## Steps to Reproduce

1. Timer konfigurieren (z.B. 5 Min), starten, bis 00:00 ablaufen lassen → expired-Zustand
2. Moderator klickt "Nochmal starten"
3. Beobachte die Timer-Anzeige in den ersten Millisekunden

4. Expected: Timer zeigt sofort Running-Farbe (grau-weiss, `--timer-bg-running`) mit voller Restzeit
5. Actual: Timer-Hintergrund flackert für einen Frame zu Warning-Orange (`--timer-bg-warning`), bevor er in den Running-Zustand wechselt

## Root Cause

In `useTimerSession.ts` wird `isWarning` synchron aus `displayRemainingMs` und `serverState` berechnet (Zeile 177–181). Nach Empfang des `STATE_UPDATE { status: 'running', remainingMs: totalDurationMs, startedAt: now }` setzt React zuerst `serverState` (via `setServerState`). Beim Re-Render ist `serverState.status === 'running'` und `displayRemainingMs` noch `0` (der letzte Wert aus dem expired-Zustand, noch nicht vom rAF-Effect aktualisiert).

Damit gilt: `displayRemainingMs (0) <= totalDurationMs * 0.2` → `isWarning = true` für genau einen Render-Frame, bevor der `useEffect` feuert und `displayRemainingMs` auf den korrekten Wert setzt.

Betroffener Code:
- `projekt/src/hooks/useTimerSession.ts`, Zeile 177–181 (isWarning-Berechnung)
- Das gleiche Problem trifft `displayRemainingMs` generell bei idle/paused: nach SET_DURATION zeigt der Timer für einen Frame `00:00`, bevor der useEffect `displayRemainingMs = remainingMs` setzt.

## Priority

Fix before release
