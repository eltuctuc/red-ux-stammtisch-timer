# BUG-FEAT1-QA-011: INVALID_TOKEN wird vom Server nie gesendet – QA-007-Fix greift nicht

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed – 2026-03-28 – timer.ts Zeile 59-62: ROOM_EXISTS → INVALID_TOKEN wenn modToken gesetzt und Token falsch

## Beschreibung

Der Fix für BUG-FEAT1-QA-007 hat in `ModeratorView.tsx` einen `useEffect`-Handler für `connectionError?.code === 'INVALID_TOKEN'` eingebaut, der bei einem invaliden Moderatoren-Token zurück zur LandingPage navigiert und dort einen Inline-Fehler anzeigt. Der Fix ist konzeptionell korrekt – aber der Server sendet den `INVALID_TOKEN`-Code niemals.

In `timer.ts` (Zeile 59-62) lautet der else-Zweig für den Fall "Token vorhanden, aber falsch":

```typescript
} else {
  // Different token trying to claim an already-owned room
  conn.send(JSON.stringify({ type: 'ERROR', code: 'ROOM_EXISTS' }));
  return;
}
```

Der Server unterscheidet nicht zwischen:
- (a) Einem neuen Moderator, dessen zufällig generierte Session-ID bereits existiert (echter Kollisionsfall)
- (b) Einem Moderator, der einen falschen Token für eine existierende Session sendet (Reconnect mit ungültigem Token)

Beide Fälle werden mit `ROOM_EXISTS` beantwortet. Der `INVALID_TOKEN`-Code existiert nur im Client-Code von `ModeratorView.tsx`, wird aber vom Server nie produziert.

## Steps to Reproduce

1. Öffne die LandingPage
2. Gib eine vollständige Moderatoren-URL ein, bei der die Session-ID korrekt ist, aber das Token falsch (z.B. eine abgelaufene URL)
3. `parseSmartInput` erkennt die URL korrekt als `moderator`-Typ
4. LandingPage navigiert zu `/session/<ID>?mod=<FALSCHER-TOKEN>`
5. `ModeratorView` verbindet via WebSocket mit falschem Token
6. Server antwortet mit `{ type: "ERROR", code: "ROOM_EXISTS" }` (nicht `INVALID_TOKEN`)
7. `ModeratorView` empfängt `ROOM_EXISTS` → Retry-Logik (Z.27-37) greift: navigiert zu einer NEUEN, leeren Session mit neuer ID

Expected: Fehler "Session nicht gefunden oder abgelaufen" auf der LandingPage mit vorausgefülltem Input-Feld
Actual: Moderator landet auf einer frischen, leeren Session (vollständig falsches Verhalten)

## Technischer Nachweis

Server (`projekt/src/party/timer.ts`, Z.48-63): Kein `INVALID_TOKEN`-Code implementiert.
Client (`projekt/src/components/ModeratorView.tsx`, Z.104-116): Wartet auf `INVALID_TOKEN`, das nie kommt.
Client (`projekt/src/components/ModeratorView.tsx`, Z.26-37): `ROOM_EXISTS` löst stattdessen neuen Session-Retry aus.

## Betroffener Edge Case aus Spec

Feature-Spec Zeile 73-74: "Ungültiger Token beim Reconnect-Flow: Fehlermeldung 'Session nicht gefunden oder abgelaufen', Eingabefeld bleibt aktiv" – dieser Edge Case ist nicht korrekt implementiert.

## Fix-Hinweis

Der Server muss zwischen Kollision und ungültigem Token unterscheiden:
- Wenn `this.state.modToken !== null` und `tokenParam !== this.state.modToken`: Sende `INVALID_TOKEN`
- Wenn `this.state.modToken === null` und eine neue Session mit der gleichen ID versucht wird (technisch nicht möglich im aktuellen Modell, da der erste Token immer gesetzt wird): Das ist der echte Kollisionsfall (ROOM_EXISTS)

Alternativ: Client in `ModeratorView.tsx` muss auf `ROOM_EXISTS` unterschiedlich reagieren je nachdem ob es ein neuer Session-Erstell-Versuch ist oder ein Reconnect (lässt sich anhand ob `modToken` vom User eingegeben wurde oder frisch generiert wurde unterscheiden, z.B. via Router-State).

## Priority
Fix now
