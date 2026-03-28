# BUG-FEAT1-QA-002: Keine Server-seitige Validierung dass Session existiert – Teilnehmer verbindet sich zu nicht-existierendem Room

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed

## Beschreibung
Das technische Design spezifiziert: "Teilnehmer: Connect zu Room `sessionId` ohne Token → Server prüft ob Room existiert. Fehlerfall: Server sendet `{ type: 'ERROR', code: 'SESSION_NOT_FOUND' }`".

Der Server (`timer.ts`) sendet jedoch niemals `SESSION_NOT_FOUND`. In PartyKit wird ein neuer Durable Object instanziiert, sobald ein Client sich zu einem Room verbindet – egal ob der Room vorher existierte oder nicht. Der Server prüft nicht, ob eine gültige Session (mit gesetztem `modToken`) bereits existiert. Ein Teilnehmer, der eine falsche 4-stellige Nummer eingibt, verbindet sich einfach zu einem frischen, leeren Room und sieht den initialen `STATE_UPDATE` mit einem leeren Timer-State – statt einer Fehlermeldung.

## Betroffene Datei(en)
- `projekt/src/party/timer.ts` Zeile 34–58 (`onConnect` sendet nie `SESSION_NOT_FOUND`)

## Steps to Reproduce / Nachweis
1. Teilnehmer gibt `9999` ein (existiert nicht)
2. Frontend navigiert zu `/session/9999`
3. `useTimerSession` verbindet sich zum Room `9999` ohne Token
4. PartyKit erstellt neuen Room `9999` (leer)
5. Server sendet `STATE_UPDATE` mit `{ status: 'idle', totalDurationMs: 0, remainingMs: 0, startedAt: null }`
6. Teilnehmer sieht `00:00` – keine Fehlermeldung

```typescript
// timer.ts: onConnect sendet immer STATE_UPDATE, nie SESSION_NOT_FOUND
conn.send(
  JSON.stringify({ type: 'STATE_UPDATE', timer: this.state.timer })
);
// Kein Check: "existiert dieser Room bereits?" fehlt komplett
```

Der AC lautet: "Bei Eingabe einer nicht existierenden oder abgelaufenen Session-Nummer wird eine verständliche Fehlermeldung angezeigt ('Session nicht gefunden')". Dieser AC ist nicht erfüllt.

## Expected
Server erkennt, ob ein Room "neu" (kein modToken gesetzt, noch nie ein Moderator verbunden) ist und sendet für Teilnehmer-Connects `SESSION_NOT_FOUND`. Frontend zeigt "Session nicht gefunden".

## Actual
Teilnehmer sieht einen leeren Timer-State `00:00` ohne jede Fehlermeldung. Der Edge-Case "ungültige Session-Nummer (Teilnehmer-Flow)" aus der Spec ist damit nicht implementiert.

## Fix-Hinweis
Im `onConnect`-Handler prüfen: Wenn kein `tokenParam` (Teilnehmer-Connect) UND `this.state.modToken === null` (Room wurde noch nie von einem Moderator initialisiert), dann `SESSION_NOT_FOUND` senden und Verbindung schließen. Alternativ: Explizites Server-seitiges Initialisierungsprotokoll, das zwischen "frisch erstellter Room vom Moderator" und "frisch erstellter Room durch ungültige Teilnehmer-Eingabe" unterscheidet.

## Priority
Fix before release
