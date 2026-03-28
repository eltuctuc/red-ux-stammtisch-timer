# BUG-FEAT1-QA-010: ModeratorView behandelt SESSION_NOT_FOUND nicht – Moderator sieht leere Session statt Fehlermeldung

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Steps to Reproduce
1. Moderator hat Bookmark einer abgelaufenen Session, z.B. `/session/1234?mod=validtoken`
2. Session ist serverseitig abgelaufen und Room wurde geschlossen
3. Moderator öffnet Bookmark → navigiert zu `ModeratorView`
4. WebSocket-Connect: Server erstellt neuen Room (leerer State), `this.state.modToken === null` → nimmt neuen Token entgegen (wie neue Session!)
5. Expected: Server erkennt abgelaufene Session und antwortet mit SESSION_NOT_FOUND oder ähnlichem Fehler; Moderator wird informiert
6. Actual: Server erstellt stillschweigend eine neue Session mit der alten sessionId und dem alten Token – der Moderator sieht eine frische Session `00:00`, ohne zu wissen dass seine ursprüngliche Session weg ist

## Technischer Nachweis

```typescript
// timer.ts Zeile 41-44: Erster Connect mit Token übernimmt immer den Room
if (this.state.modToken === null) {
  // First moderator connects – claim the token
  this.state.modToken = tokenParam;
  this.modConnections.add(conn.id);
}
```

PartyKit erstellt Durable Objects bei Connect neu, wenn sie nicht mehr existieren. Es gibt keine Unterscheidung zwischen "Room wurde gerade frisch erstellt" (echter erster Start) und "Room wurde neu erstellt weil abgelaufen" (Reconnect nach Expiry). Der alte Token funktioniert also als würde er eine neue Session erstellen – funktional unkritisch, aber semantisch falsch und potenziell verwirrend.

## Warum das ein Bug ist
- Aus Nutzersicht: Moderator öffnet Bookmark "meine laufende Session" und sieht `00:00` statt die erwarteten Timer-Daten
- Kein Hinweis, dass die Session abgelaufen war
- Das steht im Widerspruch zur SESSION_EXPIRED-Nachricht (`useTimerSession` Z.148-150), die nur beim Live-Ablauf gesendet wird, nicht beim Reconnect nach Ablauf

## Abgrenzung zu QA-002
QA-002 betraf Teilnehmer die eine nicht-existierende Session finden. Dieser Bug betrifft Moderatoren die ihre eigene abgelaufene Session wiederfinden und stillschweigend eine neue Session mit gleicher ID erstellen.

## Priority
Fix before release
