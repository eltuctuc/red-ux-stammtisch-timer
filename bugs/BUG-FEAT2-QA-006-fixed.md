# BUG-FEAT2-QA-006: START-Kommando erlaubt Start mit totalDurationMs === 0

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed — 2026-03-28

## Beschreibung
Der Server verarbeitet das `START`-Kommando ohne zu prüfen, ob `totalDurationMs > 0`:

```typescript
// timer.ts Zeile 96-108
case 'START': {
  if (timer.status !== 'idle' && timer.status !== 'expired') return;
  const now = Date.now();
  this.state.timer = {
    ...timer,
    status: 'running',
    startedAt: now,
  };
  // Kein Check: totalDurationMs > 0 fehlt
```

Im normalen UI-Flow ist das durch den Client abgesichert: `TimerControls.tsx` zeigt den Start-Button nur wenn `hasDuration = totalDurationMs > 0` und deaktiviert ihn sonst. Das ist eine client-seitige Absicherung.

Aber: Ein Angreifer (oder ein Bug im Client) könnte ein `START`-Kommando über die WebSocket-Verbindung senden, während `totalDurationMs === 0` ist. Der Timer würde dann mit `startedAt = now` und `remainingMs = 0` starten. Alle Clients würden `STATE_UPDATE { status: 'running', totalDurationMs: 0, remainingMs: 0, startedAt: now }` erhalten. Die Client-Berechnung: `Math.max(0, 0 - (Date.now() - startedAt))` = `0` → Timer zeigt sofort `00:00` im Running-State. `isWarning` = `displayRemainingMs (0) <= totalDurationMs (0) * 0.2 (0)` → `0 <= 0` → `true`. Timer zeigt sofort Warning-State.

Der 3h-Alarm wird ebenfalls gesetzt, was zu unnötigem Alarm-Handling führt.

## Betroffene Datei(en)
- `projekt/src/party/timer.ts` Zeile 96–108

## Steps to Reproduce / Nachweis
```typescript
// Direkter WS-Message-Inject (z.B. via Browser-DevTools):
// Nach Session-Erstellung, vor SET_DURATION:
socket.send(JSON.stringify({ type: 'START' }));
// → Server akzeptiert, broadcastet STATUS: 'running' mit totalDurationMs: 0
```

## Expected
`START`-Kommando wird abgelehnt wenn `totalDurationMs === 0`.

## Actual
Timer startet mit `totalDurationMs === 0`, zeigt sofort `00:00` in Warning/Running-Zustand.

## Fix-Hinweis
Im `START`-Case prüfen:
```typescript
case 'START': {
  if (timer.status !== 'idle' && timer.status !== 'expired') return;
  if (timer.totalDurationMs === 0) return; // Keine Dauer gesetzt
  // ...
}
```

## Priority
Fix before release
