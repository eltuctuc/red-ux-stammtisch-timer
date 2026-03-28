# BUG-FEAT1-QA-016: Server schließt Connection nach INVALID_TOKEN nicht – Zombie-Connection möglich

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed — 2026-03-28
- **Fix:** Added `conn.close()` in `timer.ts` after sending `ROOM_EXISTS`, `INVALID_TOKEN`, and `SESSION_NOT_FOUND` (participant). Server now immediately closes the connection after sending any error response.

## Beschreibung

In `timer.ts` werden beim Senden von Fehlermeldungen die WebSocket-Verbindungen unterschiedlich behandelt:

| Fall | conn.send() | conn.close() |
|---|---|---|
| Session expired (onConnect, Zeile 40–43) | ✅ | ✅ |
| INVALID_TOKEN (Zeile 61–62) | ✅ | ❌ |
| SESSION_NOT_FOUND / Participant (Zeile 67–68) | ✅ | ❌ |

Beim Empfang von `INVALID_TOKEN` navigiert `ModeratorView.tsx` (via `useEffect`) zur LandingPage. React unmountet daraufhin `ModeratorView` → `useTimerSession` Cleanup (Zeile 155–158 `useTimerSession.ts`) ruft `socket.close()` auf. Die serverseitige Verbindung wird damit clientseitig geschlossen.

**Aber:** Es gibt ein Timing-Problem zwischen dem Empfang der ERROR-Message, dem React-Render-Cycle, der `navigate()`-Ausführung und dem tatsächlichen Unmount. In dieser Zeitspanne ist die Connection auf dem Server aktiv – sie gehört zur `room.getConnections()`-Menge und erhält `broadcast()`-Nachrichten.

Der schwerwiegendere Fall: `SESSION_NOT_FOUND` für Teilnehmer (Zeile 67–68) schließt die Verbindung ebenfalls nicht. Der Teilnehmer-Client (`ParticipantView`) navigiert nach Erhalt des Errors zur LandingPage – derselbe Timing-Effekt gilt.

## Betroffene Datei

`projekt/src/party/timer.ts` – Zeilen 61–62 (INVALID_TOKEN), 67–68 (SESSION_NOT_FOUND)

## Vergleich mit korrekter Implementierung

```typescript
// Korrekt (Zeile 40–43 – expired):
conn.send(JSON.stringify({ type: 'ERROR', code: 'SESSION_NOT_FOUND' }));
conn.close();
return;

// Fehlerhaft (Zeile 61–62 – INVALID_TOKEN):
conn.send(JSON.stringify({ type: 'ERROR', code: 'INVALID_TOKEN' }));
return;  // conn.close() fehlt
```

## Steps to Reproduce

1. Moderator connectet mit falschem Token
2. Server sendet INVALID_TOKEN
3. Client-Navigation zur LandingPage startet
4. In der Zeit zwischen ERROR-Empfang und React-Unmount: Verbindung bleibt serverseitig offen
5. Expected: Server schließt Verbindung sofort nach ERROR-Senden
6. Actual: Verbindung bleibt bis zum clientseitigen Close offen; Server broadcastet Timer-Updates an diese Verbindung

## Priority

Fix before release
