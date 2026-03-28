# BUG-FEAT1-QA-001: Session-Erstellung ohne Server-Roundtrip – Kollisions-Handling nicht implementiert

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung
Das technische Design spezifiziert explizit: "Kollision wird beim Connect erkannt (Server antwortet mit `ROOM_EXISTS`, Frontend generiert neue ID)". Dieser Mechanismus ist weder im Server (`timer.ts`) noch im Client-Hook (`useTimerSession.ts`) noch in `LandingPage.tsx` implementiert. Der Server sendet kein `ROOM_EXISTS`. Das Frontend versucht keinen Retry bei Kollision.

In der Praxis bedeutet das: Wenn eine Session-ID zufällig mit einer bereits existierenden Session kollidiert, verbindet sich der neue "Moderator" mit der bestehenden Session – der erste `modToken` gewinnt (da `this.state.modToken === null` bereits `false` ist). Der neue Moderator erhält kein Token und hat keine Kontrolle über die Session. Beide Seiten sehen inkonsistente Zustände.

## Betroffene Datei(en)
- `projekt/src/party/timer.ts` Zeile 38–57 (kein ROOM_EXISTS Message-Type)
- `projekt/src/components/LandingPage.tsx` Zeile 16–25 (kein Retry-Logic)
- `projekt/src/hooks/useTimerSession.ts` (kein Handling für ROOM_EXISTS)

## Steps to Reproduce / Nachweis
1. Session A existiert mit ID `4321` und modToken `token-A`
2. Neuer Moderator klickt "Neue Session starten" – Frontend generiert zufällig die gleiche ID `4321` und einen neuen Token `token-B`
3. `useTimerSession` verbindet sich zum Room `4321` mit `?mod=token-B`
4. Server: `this.state.modToken` ist bereits `token-A` → `token-B !== token-A` → sendet `INVALID_TOKEN`
5. Frontend: zeigt "Ungültiger Token" statt einer neuen Session zu generieren

```typescript
// timer.ts Zeile 38-51: kein ROOM_EXISTS Branch
if (this.state.modToken === null) {
  this.state.modToken = tokenParam;  // Nur möglich wenn Room neu
} else if (tokenParam === this.state.modToken) {
  // Returning moderator
} else {
  // Collision case – falsch behandelt als INVALID_TOKEN
  conn.send(JSON.stringify({ type: 'ERROR', code: 'INVALID_TOKEN' }));
}
```

## Expected
Server sendet `{ type: 'ERROR', code: 'ROOM_EXISTS' }` bei Token-Mismatch auf neuem Connect. Frontend erkennt `ROOM_EXISTS` und generiert neue Session-ID + Token, versucht erneut.

## Actual
Kollision wird als `INVALID_TOKEN` behandelt. Der Nutzer sieht einen unverständlichen Fehler anstatt eine neue Session zu erhalten. Die neue Session wird nie erstellt.

## Fix-Hinweis
Server: Unterscheiden zwischen "erster Moderator" (modToken === null → akzeptieren), "bekannter Moderator" (Token-Match → akzeptieren) und "neuer Connect auf bestehenden Room" (Token-Mismatch → `ROOM_EXISTS` senden). Client: Bei `ROOM_EXISTS` neue ID + Token generieren und Verbindung neu aufbauen (max. 3 Versuche).

## Priority
Fix before release
