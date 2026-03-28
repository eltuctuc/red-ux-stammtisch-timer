# BUG-FEAT2-QA-003: Warning-Threshold berechnet auf displayRemainingMs statt serverState – Inkonsistenz zwischen Clients

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** Logic
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung
Die `isWarning`-Berechnung in `useTimerSession.ts` verwendet `displayRemainingMs` für den Schwellwert-Vergleich:

```typescript
// useTimerSession.ts Zeile 169-174
const isWarning =
  serverState !== null &&
  serverState.totalDurationMs > 0 &&
  serverState.status !== 'idle' &&
  serverState.status !== 'expired' &&
  displayRemainingMs <= serverState.totalDurationMs * 0.2;
```

`displayRemainingMs` ist ein lokaler rAF-berechneter Wert. Zwei Clients (Moderator-Tab und Teilnehmer-Tab) berechnen `displayRemainingMs` unabhängig voneinander. Der Zeitpunkt des Warning-Übergangs kann damit um bis zu ~1 Sekunde zwischen den Clients abweichen – was der Spec-Toleranz entspricht. Das ist grundsätzlich akzeptabel.

Das eigentliche Problem: Wenn `serverState.status === 'paused'`, wird `isWarning` weiterhin berechnet. Ein pausierter Timer bei z.B. 19% Restzeit zeigt korrekt Warning-Farbe. Aber wenn `displayRemainingMs` im pausierten Zustand `serverState.remainingMs` ist (kein rAF-Tick) und dieser Wert ≤ 20%, korrekt Warning anzeigen. Das ist tatsächlich korrekt.

**Das echte Problem:** Die Spec sagt "Timer-Zustand 'warning': Timer **läuft**, verbleibende Zeit ≤ 20%". Ein pausierter Timer im Warning-Bereich sollte per Definition keinen Warning-State haben – er **läuft** nicht. Die aktuelle Implementierung zeigt Warning auch für `status === 'paused'`, was der Spec-Definition widerspricht.

## Betroffene Datei(en)
- `projekt/src/hooks/useTimerSession.ts` Zeile 169–174

## Steps to Reproduce / Nachweis
1. Moderator wählt 10-Minuten-Timer, startet ihn
2. Timer läuft bis 1:50 (knapp unter 20% von 10 Min = 2:00)
3. Warning-State aktiv (korrekt)
4. Moderator pausiert Timer
5. `serverState.status = 'paused'`, `isWarning = displayRemainingMs <= totalDurationMs * 0.2`
6. `isWarning = true` (da `displayRemainingMs` noch ≤ 20% ist)
7. Laut Spec: "warning"-Zustand gilt nur wenn Timer **läuft** → pausierter Timer sollte neutral aussehen

## Expected
Laut Spec-Definition: `isWarning` ist nur `true` wenn `status === 'running'` und `displayRemainingMs <= totalDurationMs * 0.2`.

## Actual
`isWarning` ist `true` auch wenn `status === 'paused'` (solange Restzeit ≤ 20%).

## Fix-Hinweis
Bedingung um `serverState.status === 'running'` erweitern:

```typescript
const isWarning =
  serverState !== null &&
  serverState.totalDurationMs > 0 &&
  serverState.status === 'running' &&
  displayRemainingMs <= serverState.totalDurationMs * 0.2;
```

## Priority
Fix before release
