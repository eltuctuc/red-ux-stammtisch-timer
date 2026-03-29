# BUG-FEAT2-QA-015: displayRemainingMs zeigt 00:00 für einen Frame nach SET_DURATION

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Steps to Reproduce

1. Moderatoren-Ansicht öffnen, kein Timer konfiguriert
2. Preset-Button "10 Min" klicken
3. Timer-Anzeige in den ersten Millisekunden nach dem Klick beobachten

4. Expected: Timer zeigt sofort `10:00`
5. Actual: Timer zeigt für einen Frame `00:00`, dann springt er auf `10:00`

## Root Cause

In `useTimerSession.ts` läuft die Synchronisierung von `displayRemainingMs` über einen `useEffect` (Zeile 63–93). Nach `setServerState(newState)` (ausgelöst durch den STATE_UPDATE vom Server) re-rendert der Hook. Beim ersten Render nach dem State-Update ist `displayRemainingMs` noch `0` (Initialwert). Erst nach dem Render feuert der `useEffect`, der `setDisplayRemainingMs(serverState.remainingMs)` aufruft.

Damit wird für genau einen Render-Frame `displayMs = 0` an `TimerDisplay` übergeben, was als `00:00` dargestellt wird.

Betrifft: Alle Übergänge wo `status !== 'running'` und `remainingMs > 0`:
- Nach Preset-Auswahl (idle mit Dauer)
- Nach Custom-Zeit-Eingabe (idle mit Dauer)
- Nach PAUSE (paused mit Restzeit)
- Nach RESET (idle mit totalDurationMs)

Die Variante für `status === 'running'` ist separat durch QA-014 (isWarning-Flash) erfasst.

## Priority

Nice-to-have (einzelner Frame, kaum wahrnehmbar – aber bei schnellen Übergängen auf High-Refresh-Rate-Displays sichtbar)
