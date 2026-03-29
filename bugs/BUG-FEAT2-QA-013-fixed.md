# BUG-FEAT2-QA-013: START aus expired-State – remainingMs=0 im STATE_UPDATE, Client zeigt sofort 00:00

- **Feature:** FEAT-2 – Timer
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed
- **Fixed on:** 2026-03-29
- **Fix:** In `timer.ts` START-Handler `startingRemainingMs` berechnet (expired → totalDurationMs, sonst remainingMs) und explizit in `this.state.timer` gesetzt. alarmDelay ebenfalls auf `startingRemainingMs` vereinheitlicht.

## Beschreibung

BUG-FEAT2-QA-009 hat den Server-seitigen Alarm-Delay korrekt gefixt (nun `totalDurationMs` statt 0).
Jedoch wurde der `remainingMs`-Wert im `STATE_UPDATE`-Broadcast nicht korrigiert:

```typescript
// timer.ts, case 'START', Zeile 142–146
this.state.timer = {
  ...timer,          // <-- timer.remainingMs ist 0 nach 'expired'
  status: 'running',
  startedAt: now,
};
```

Der Spread `...timer` übernimmt `remainingMs: 0` unverändert. Das STATE_UPDATE an alle Clients enthält damit
`{ status: 'running', remainingMs: 0, startedAt: now }`.

Der Client-Hook (`useTimerSession.ts`, Zeile 69) berechnet:
```
computed = Math.max(0, remainingMs - (Date.now() - startedAt))
         = Math.max(0, 0 - elapsed)
         = 0
```

Der Countdown zeigt sofort 00:00 und bleibt dort – kein sichtbarer Countdown, obwohl der Server-Alarm
korrekt erst nach `totalDurationMs` feuert.

## Steps to Reproduce

1. Moderator wählt 5-Minuten-Timer, startet ihn
2. Timer läuft auf 00:00 – expired-State erreicht
3. Moderator klickt "Nochmal starten"
4. Expected: Timer zeigt 05:00 und beginnt herunterzuzählen (auf allen Clients)
5. Actual: Timer zeigt sofort 00:00 in beiden Tabs – kein Countdown sichtbar; nach 5 Minuten
   feuert der Server-Alarm erneut und setzt Status zurück auf 'expired'

## Root Cause

Im `START`-Handler muss bei `status === 'expired'` der Wert `remainingMs: timer.totalDurationMs`
explizit gesetzt werden, analog zum Alarm-Fix:

```typescript
// Fix: beide Werte konsistent setzen
const startingRemainingMs = timer.status === 'expired' ? timer.totalDurationMs : timer.remainingMs;
this.state.timer = {
  ...timer,
  status: 'running',
  remainingMs: startingRemainingMs,
  startedAt: now,
};
const alarmDelay = startingRemainingMs; // bereits korrekt in QA-009 berechnet, aber inkonsistent
```

## Kontext

QA-009-fixed hat den Alarm-Delay korrekt auf `totalDurationMs` gesetzt (Zeile 150–151).
Die Fix-Beschreibung in BUG-FEAT2-QA-009-fixed.md lautet "Im START-Handler `timer.remainingMs`
bei `status === 'expired'` durch `timer.totalDurationMs` ersetzt" – das ist jedoch im Code
nicht implementiert worden. Nur die `alarmDelay`-Variable ist korrekt; die `this.state.timer`-
Zuweisung wurde nicht angepasst.

## Priority
Fix now
