# BUG-FEAT2-QA-009: START aus "expired"-State setzt Alarm mit delay=0 – Timer springt sofort zurück auf 'expired'

- **Feature:** FEAT-2 – Timer
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed — 2026-03-28: Im START-Handler `timer.remainingMs` bei `status === 'expired'` durch `timer.totalDurationMs` ersetzt

## Steps to Reproduce
1. Moderator wählt 5-Minuten-Timer, startet ihn
2. Timer läuft auf 00:00 – Server-Alarm feuert, Status wird 'expired', `remainingMs` wird auf 0 gesetzt
3. Client-Ansicht zeigt expired-State + "Nochmal starten"-Button
4. Moderator klickt "Nochmal starten"
5. Server empfängt `START`-Kommando

Expected: Timer startet erneut mit 5:00 und läuft normal.
Actual: Server verarbeitet START korrekt (status → 'running', startedAt = now), setzt dann aber den Timer-Alarm auf `now + timer.remainingMs` = `now + 0`. Der Alarm feuert sofort (delay = 0ms), der onAlarm-Handler setzt `status: 'expired'` erneut und broadcastet. Timer wechselt sofort wieder zu 'expired', ohne erkennbaren Countdown.

## Technischer Nachweis

```typescript
// timer.ts Zeile 207-221: onAlarm setzt remainingMs auf 0
async onAlarm() {
  if (this.state.alarmType === 'timer') {
    this.state.timer = {
      ...this.state.timer,
      status: 'expired',
      remainingMs: 0,   // <-- wird explizit auf 0 gesetzt
      startedAt: null,
    };
    ...
  }
}

// timer.ts Zeile 137-151: START liest timer.remainingMs für den Alarm
case 'START': {
  if (timer.status !== 'idle' && timer.status !== 'expired') return;  // expired ist erlaubt
  if (timer.totalDurationMs === 0) return;
  const now = Date.now();
  this.state.timer = { ...timer, status: 'running', startedAt: now };
  void this.room.storage.setAlarm(now + timer.remainingMs);  // now + 0 = sofortiger Alarm
  ...
}
```

Der START-Handler erlaubt `status === 'expired'` als Ausgangszustand (für den "Nochmal starten"-Button). Er setzt den Alarm jedoch auf `now + timer.remainingMs`. Da `remainingMs` nach dem Ablauf explizit auf `0` gesetzt wird, ist das Alarm-Delay 0. Der Alarm feuert unmittelbar.

## Root Cause
Inkonsistenz zwischen zwei Fixes: QA-006 erlaubt START aus 'expired', aber der Alarm-Ausdruck (Zeile 149) wurde nicht angepasst, um bei `remainingMs === 0` auf `totalDurationMs` zurückzufallen.

## Priority
Fix now
