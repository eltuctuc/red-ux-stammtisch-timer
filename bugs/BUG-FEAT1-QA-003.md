# BUG-FEAT1-QA-003: modToken im Frontend-State exponiert – sichtbar in React DevTools und State-Dumps

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Security
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung
Der `modToken` wird als React-Props durch den Component-Tree gereicht (`SessionPage` → `ModeratorView` → `ShareSection`) und ist damit vollständig in React DevTools sichtbar. Zusätzlich wird er in der URL als `?mod=<token>` exponiert – was laut Spec bewusst ist (Security-by-Obscurity). Das Problem ist die zusätzliche Exposition durch `useTimerSession`: Der `modToken` wird als Hook-Parameter übergeben und verbleibt im JavaScript-Memory als String, ohne je explizit gelöscht zu werden.

Kritischer ist folgender Aspekt: Der `modToken` wird als Query-Parameter an die WebSocket-URL angehängt. PartySocket übergibt ihn als URL-Parameter `?mod=<token>` bei jeder Reconnect-Anfrage. Das bedeutet, der Token erscheint in Server-Logs, Browser-Netzwerk-Tabs (Network-Panel → WS-Verbindungen) und potenziell in Proxy-Logs – zusätzlich zur URL-Bar.

## Betroffene Datei(en)
- `projekt/src/hooks/useTimerSession.ts` Zeile 107–117 (Token als Query-Parameter)
- `projekt/src/components/SessionPage.tsx` Zeile 13 (Token aus URL direkt weitergeleitet)
- `projekt/src/components/ModeratorView.tsx` Zeile 16 (Token als Prop)
- `projekt/src/components/ShareSection.tsx` Zeile 15 (Token in moderatorUrl)

## Steps to Reproduce / Nachweis
```typescript
// useTimerSession.ts Zeile 108-111: Token explizit in WS-Query
const query: Record<string, string> = {};
if (modToken) {
  query.mod = modToken;  // Erscheint in WS-URL: ws://host/party/1234?mod=TOKEN
}
```

Browser DevTools → Network → WS-Tab → Headers: Token ist im Request-URL sichtbar.

## Expected
Das Verhalten ist laut Spec als Security-by-Obscurity bewusst akzeptiert. Aber: Die Spec erwähnt explizit "Moderatoren-URL per Copy-Button kopieren" – der Token in der URL ist also das gewünschte Design. Was fehlt, ist ein Hinweis in der ShareSection, dass der Moderatoren-Link geheim zu halten ist.

Die ShareSection zeigt zwar den Text "Mein Moderatoren-Link (privat halten)" – das ist korrekt. Kein Bug hier, aber der Token in den WS-Logs ist eine erhöhte Exposition, die dokumentiert werden sollte.

## Actual
Token ist in WebSocket-URL sichtbar (Network-Tab) – dies ist eine zusätzliche Expositions-Stelle über die URL-Bar hinaus, die laut Spec der einzige vorgesehene Ort ist.

## Fix-Hinweis
Optionale Verbesserung: Token könnte als Custom-Header oder im WebSocket-Handshake-Payload statt als URL-Query-Parameter übertragen werden. Das würde Logging-Exposition reduzieren. Da Security-by-Obscurity bewusste Designentscheidung, ist dies Nice-to-have.

## Priority
Nice-to-have
