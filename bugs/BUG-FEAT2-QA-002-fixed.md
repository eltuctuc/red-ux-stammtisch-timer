# BUG-FEAT2-QA-002: Timer-Ablauf setzt Status nicht auf "expired" – Server hat keinen Expiry-Mechanismus

- **Feature:** FEAT-2 – Timer
- **Severity:** Critical
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed

## Beschreibung
Der Timer-Status `'expired'` wird im Server **niemals gesetzt**. Der gesamte `timer.ts`-Code enthält keinen Pfad, der `status: 'expired'` schreibt und broadcastet.

Die Architektur ist "kein Server-Tick" – der Client berechnet die verbleibende Zeit lokal. Wenn der Client `displayRemainingMs === 0` erkennt, wechselt er lokal visuell in den expired-Zustand. Aber: Der Server-State bleibt auf `status: 'running'`, `remainingMs: <original>`, `startedAt: <startzeit>`.

Konsequenzen:
1. Ein neuer Teilnehmer, der nach Timer-Ablauf beitritt, erhält einen `STATE_UPDATE` mit `status: 'running'` und sieht einen negativen bzw. auf 0 geclampten Timer – aber keinen `expired`-Zustand und keinen Sound.
2. Nach einem Page-Reload sieht der Moderator wieder `status: 'running'` statt `expired`.
3. Der AC "Bei 00:00 wechselt der Timer in den Zustand 'expired'" ist nur client-seitig durch rAF-Berechnung implementiert, nicht server-seitig persistent.
4. Der Edge Case "Teilnehmer tritt Session bei während Timer läuft: Erhält sofort den aktuellen Stand" funktioniert nach Ablauf nicht korrekt.

## Betroffene Datei(en)
- `projekt/src/party/timer.ts` (kein Expiry-Trigger vorhanden)
- `projekt/src/hooks/useTimerSession.ts` Zeile 64–65 (Client-seitige Berechnung endet bei 0, setzt aber keinen Server-Status)

## Steps to Reproduce / Nachweis

```typescript
// timer.ts: KEIN Code der status auf 'expired' setzt
// Alle switch-Cases: SET_DURATION, START, PAUSE, RESUME, RESET
// Keiner davon resultiert in status: 'expired'

// useTimerSession.ts Zeile 64-65:
const computed = Math.max(0, state.remainingMs - (Date.now() - state.startedAt));
setDisplayRemainingMs(computed);
// Wenn computed === 0: rAF stoppt, displayMs bleibt bei 0
// serverState.status bleibt 'running' – nie 'expired'
```

Szenario:
1. Moderator startet 2-Minuten-Timer
2. 2 Minuten vergehen – Client zeigt `00:00`, Sound wird abgespielt
3. Neuer Teilnehmer joined
4. Server sendet `STATE_UPDATE { status: 'running', startedAt: <vor 2min> }`
5. Client berechnet: `remainingMs - (now - startedAt)` = negativer Wert → geclampter auf 0
6. `displayRemainingMs = 0` → rAF stoppt
7. Aber: `serverState.status === 'running'`, also `isWarning` wird berechnet → `displayRemainingMs (0) <= totalDurationMs * 0.2` → `isWarning = true`
8. Timer zeigt `00:00` mit Warning-Farbe, nicht Expired-Farbe

## Expected
Server erkennt Timer-Ablauf und setzt Status auf 'expired' mit Broadcast an alle Clients. Neu joinende Teilnehmer erhalten korrekt `status: 'expired'`.

## Actual
Server-Status bleibt dauerhaft `'running'` nach Ablauf. Neu joinende Clients sehen falschen Zustand (Warning-Farbe statt Expired-Farbe, potentiell falscher isWarning-State).

## Fix-Hinweis
Zwei Optionen:
1. **Client-seitig (einfacher):** Wenn `displayRemainingMs` auf 0 sinkt, sendet der Client ein `EXPIRE`-Kommando an den Server (nur wenn Moderator) oder der Hook setzt lokal `serverState.status` auf 'expired'. Problem: Race Condition bei mehreren Moderatoren.
2. **Server-seitig (korrekt):** Bei `START` einen PartyKit Alarm auf `jetzt + remainingMs` setzen. Alarm-Handler setzt `status: 'expired'` und broadcastet `STATE_UPDATE`. Der 3h-Session-Alarm bleibt separat.

Option 2 ist die korrekte Lösung gemäß der Spec-Architektur.

## Priority
Fix now
