# BUG-FEAT1-QA-007: Ungültiger Moderatoren-Token beim Reconnect zeigt Fehler auf falscher Seite – Edge Case aus Spec nicht erfüllt

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Steps to Reproduce
1. Moderator gibt auf der Landing Page eine vollständige Moderatoren-URL mit ungültigem Token ein (z.B. korrekte sessionId, aber falscher Token)
2. `parseSmartInput` erkennt die URL korrekt als `{ type: 'moderator', sessionId: '1234', token: 'wrong-token' }`
3. `LandingPage.tsx` navigiert sofort zu `/session/1234?mod=wrong-token`
4. `ModeratorView` startet und sendet WebSocket-Connect mit dem falschen Token
5. Server sendet `{ type: 'ERROR', code: 'INVALID_TOKEN' }` (da sessionId existiert aber Token falsch)
6. `ModeratorView` zeigt "Ungültiger Moderatoren-Token. Bitte die Moderatoren-URL überprüfen." mit Link zur Startseite

Expected: Laut Spec Edge Case "Ungültiger Token beim Reconnect-Flow": "Fehlermeldung 'Session nicht gefunden oder abgelaufen', Eingabefeld bleibt aktiv" – Fehler erscheint als Inline-Fehler auf der Landing Page, der User verlässt die Landing Page nicht.

Actual: User wird von der Landing Page wegnavigiert, sieht die Fehlermeldung auf der Session-Seite (andere Route), muss explizit zurückklicken. Das Eingabefeld auf der Landing Page ist nicht mehr aktiv.

## Technischer Nachweis

```typescript
// LandingPage.tsx Zeile 36-47: keine Server-Validierung vor Navigation
const result = parseSmartInput(inputValue);
if (result.type === 'moderator') {
  navigate(`/session/${result.sessionId}?mod=${result.token}`);
  // Sofortige Navigation – kein Pre-Check ob Token gültig ist
}
```

Die Landing Page hat keine Möglichkeit den Token vorab zu validieren (kein REST-Endpoint). Die Validierung passiert erst nach dem WebSocket-Connect in `ModeratorView`. Das führt dazu, dass der Fehler-Kontext verloren geht.

## Betroffener Edge Case aus Spec
Feature-Spec Zeile 73-74: "Ungültiger Token beim Reconnect-Flow: Fehlermeldung 'Session nicht gefunden oder abgelaufen', Eingabefeld bleibt aktiv"

Zusätzlich: AC-03 ist partiell korrekt (gültige URL öffnet Moderatoren-Ansicht), aber der Fehlerfall des gleichen ACs ist nicht spec-konform implementiert.

## Priority
Fix before release
