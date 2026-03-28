# BUG-FEAT2-QA-001: Sound-Trigger-Logik feuert bei falschen Bedingungen – Race Condition

- **Feature:** FEAT-2 – Timer
- **Severity:** High
- **Bereich:** Logic
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung
Der Sound-Trigger in `useTimerSession.ts` hat eine fehlerhafte Bedingung:

```typescript
// useTimerSession.ts Zeile 99
if (prev === 'running' && (curr === 'expired' || displayRemainingMs === 0)) {
  playExpireSound();
}
```

**Problem 1: Falsch positiver Sound bei Pause.**
Wenn der Moderator den Timer auf exakt `1000ms` startet und sofort pausiert, kann `displayRemainingMs` kurz `0` anzeigen (durch rAF-Timing), obwohl der Status `paused` ist und der Timer nicht abgelaufen ist. `prev === 'running'` und `displayRemainingMs === 0` würden den Sound feuern, obwohl `curr === 'paused'`.

**Problem 2: Falsch positiver Sound beim Reconnect.**
Wenn ein Teilnehmer der Session beitritt während der Timer bereits abgelaufen ist (status = 'expired'), ist `prevStatusRef.current` initial `null`. Der erste `STATE_UPDATE` setzt `curr = 'expired'`. Die Bedingung `prev === 'running'` ist dann `false` – das ist korrekt und würde in diesem Fall keinen Sound triggern. Aber: Nach einem Page-Reload mit laufendem Timer kurz vor Ablauf kann der erste `serverState`-Update `status = 'running'` sein, der zweite `status = 'expired'`. Dann: `prev = 'running'`, `curr = 'expired'` → Sound. Das ist korrekt. Aber bei `displayRemainingMs === 0` UND `curr = 'paused'` (wenn Timer auf 1s pausiert wird) → falscher Sound.

**Problem 3: Sound-Trigger-Effect-Abhängigkeit.**
Der Effect hat `[serverState, displayRemainingMs]` als Dependencies. `displayRemainingMs` ändert sich bei jedem rAF-Frame (ca. 60x/Sekunde). Der Effect läuft damit extrem häufig. Die Bedingung `displayRemainingMs === 0` könnte für mehrere aufeinanderfolgende Frames gelten und den Sound mehrfach triggern – allerdings verhindert `prevStatusRef.current = curr` nach dem ersten Fire weitere Triggers (da `prev !== 'running'` nach dem ersten Durchlauf). Dennoch ist die Implementierung fragil.

## Betroffene Datei(en)
- `projekt/src/hooks/useTimerSession.ts` Zeile 92–104

## Steps to Reproduce / Nachweis

**Szenario 1 (falscher Sound bei Pause nahe 0):**
1. Moderator setzt Custom-Time auf 1 Sekunde
2. Moderator startet Timer
3. Moderator pausiert Timer innerhalb der ersten 100ms
4. rAF-Tick kann `displayRemainingMs = 0` berechnen (da `remainingMs=1000 - elapsed` ≈ 0 möglich)
5. Effect: `prev=running`, `curr=paused`, `displayRemainingMs=0` → Sound feuert falsch

**Szenario 2 (doppelter Sound bei Status-Wechsel):**
Die Condition prüft ODER: `curr === 'expired' || displayRemainingMs === 0`. Wenn der Server-Status auf `expired` wechselt UND `displayRemainingMs` gleichzeitig `0` ist, kann der Effect durch zwei unterschiedliche Dependency-Änderungen zweimal ausgelöst werden: einmal durch `serverState`-Änderung, einmal durch `displayRemainingMs`-Änderung. Beide Male: `prev=running`, Condition true → Sound zwei Mal.

## Expected
Sound wird genau einmal abgespielt, wenn der Timer von 'running' auf 'expired' wechselt. Kein Sound bei Pause, Reset oder Reconnect auf bereits abgelaufene Session.

## Actual
Unter bestimmten Bedingungen kann Sound falsch positiv (bei Pause nahe 0) oder mehrfach (bei simultanen State-Updates) feuern.

## Fix-Hinweis
Sound-Trigger nur auf `serverState.status`-Transition von 'running' → 'expired' beschränken, ohne `displayRemainingMs` als Trigger-Bedingung:

```typescript
if (prev === 'running' && curr === 'expired') {
  playExpireSound();
}
```

Den `displayRemainingMs === 0`-Check aus der Bedingung entfernen. Wenn der Server den Status nicht auf 'expired' setzt (Edge Case: Server-seitige Alarm-Logik fehlt – siehe BUG-FEAT2-QA-002), ist das ein separates Problem.

## Priority
Fix before release
