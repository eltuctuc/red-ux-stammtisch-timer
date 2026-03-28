# BUG-FEAT1-QA-012: ModeratorView zeigt '00:00' während Verbindungsaufbau beim Reconnect

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed – 2026-03-28 – durch UX-014-Fix in ModeratorView.tsx mitgefixt (displayMs = null wenn connecting && !timerState)

## Beschreibung

Der Fix BUG-FEAT1-UX-010 hat in `ParticipantView.tsx` korrekt `displayMs=null` während `connecting` implementiert, sodass der Timer '--:--' zeigt. `ModeratorView.tsx` hat diesen Fix nicht erhalten.

In `ModeratorView.tsx` Zeile 53:

```typescript
const displayMs = timerState?.displayRemainingMs ?? 0;
```

Beim Reconnect eines Moderators zur bestehenden Session gibt es eine kurze Phase, in der `connectionStatus === 'connecting'` und `timerState === null` ist. In dieser Phase zeigt der Timer `00:00` mit Status `idle`, obwohl der tatsächliche Timer-Wert noch nicht empfangen wurde.

## Steps to Reproduce

1. Moderator hat eine laufende Session mit Timer (z.B. 10:00 laufend)
2. Moderator schließt den Tab und öffnet die Moderatoren-URL erneut (Reconnect)
3. Kurz nach dem Laden der Seite (vor dem ersten STATE_UPDATE)
4. Expected: Timer zeigt '--:--' (Loading-Placeholder) wie in ParticipantView
5. Actual: Timer zeigt '00:00' mit Idle-Hintergrund – potenziell verwirrend beim Reconnect

## Scope-Einschränkung

Bei neuer Session-Erstellung (erster Moderator-Connect) ist `00:00` korrekt, da der Timer tatsächlich auf `0` initialisiert wird. Das Problem tritt nur beim Reconnect-Flow auf.

## Priority
Nice-to-have
