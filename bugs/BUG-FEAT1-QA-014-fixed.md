# BUG-FEAT1-QA-014: ROOM_EXISTS wird vom Server nie gesendet – Session-ID-Kollision löst INVALID_TOKEN aus

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed — 2026-03-28
- **Fix:** Added `?new=1` URL parameter to distinguish new-session creation from reconnect. `timer.ts` checks `isNewSession` flag: if `new=1` AND room already has a different token → sends `ROOM_EXISTS`; without `new=1` → sends `INVALID_TOKEN`. `LandingPage.tsx` adds `&new=1` on new session creation. `SessionPage.tsx` reads and passes `isNew` to `ModeratorView`. `ModeratorView` and `useTimerSession` propagate `isNew` to the WebSocket query. Retry navigate also carries `&new=1`.

## Beschreibung

Der QA-011-Fix hat die Server-Logik korrekt umgebaut: Wenn ein Moderator mit falschem Token connectet, bekommt er jetzt `INVALID_TOKEN`. Dabei wurde aber `ROOM_EXISTS` komplett aus `timer.ts` entfernt – der Server sendet diesen Code nirgends mehr.

Das Problem: Die Spec beschreibt explizit das Session-ID-Kollisions-Szenario: "4-stellige Nummer bereits vergeben → Server generiert erneut bis eine freie Nummer gefunden ist". Der ursprüngliche Mechanismus war: Server sendet `ROOM_EXISTS`, Client generiert neue ID und reconnectet. Dieser Mechanismus ist jetzt gebrochen.

**Was jetzt bei einer Kollision passiert:**

1. Moderator A hat Session `1234` mit Token `token-A`
2. Moderator B generiert zufällig dieselbe Session-ID `1234` mit Token `token-B`
3. Moderator B connectet mit `?mod=token-B`
4. Server: `modToken === 'token-A'` (gesetzt), `tokenParam === 'token-B'` → Branch: `else` → sendet `INVALID_TOKEN`
5. `ModeratorView.tsx` empfängt `INVALID_TOKEN` → navigiert zur LandingPage mit Fehlermeldung "Session nicht gefunden oder abgelaufen. Bitte überprüfe deine Moderatoren-URL."

**Konsequenz:** Der Moderator B sieht eine irreführende Fehlermeldung ("überprüfe deine Moderatoren-URL") obwohl seine URL korrekt ist. Er kann keine neue Session erstellen, weil er denkt, sein Link sei kaputt. Der eigentliche Retry-Loop (ROOM_EXISTS → neue ID generieren) greift nie.

## Betroffene Dateien

- `projekt/src/party/timer.ts` – sendet `ROOM_EXISTS` nicht mehr (Zeilen 48–70: nur `INVALID_TOKEN` oder `SESSION_NOT_FOUND`)
- `projekt/src/components/ModeratorView.tsx` – hat noch toten Code für `ROOM_EXISTS`-Handler (Zeilen 26–37, 120–123)

## Nachweis (Code-Analyse)

```typescript
// timer.ts – vollständige onConnect-Logik für tokenParam-Branch:
if (this.state.modToken === null) {
  // Token setzen – erstes Connect
} else if (tokenParam === this.state.modToken) {
  // Korrekter Reconnect
} else {
  // IMMER INVALID_TOKEN – auch bei ID-Kollision
  conn.send(JSON.stringify({ type: 'ERROR', code: 'INVALID_TOKEN' }));
  return;
}
```

```bash
# Beweis: ROOM_EXISTS kommt im gesamten server-seitigen Code nie vor:
grep -r "ROOM_EXISTS" projekt/src/party/  # → No matches found
```

Der Client-Code in `ModeratorView.tsx` Zeilen 26–37 (ROOM_EXISTS-Retry) ist toter Code und kann nie ausgeführt werden.

## Steps to Reproduce

1. Simuliere eine Session-ID-Kollision (zwei Moderatoren generieren zufällig dieselbe 4-stellige ID)
2. Moderator A erstellt Session `1234` mit Token `token-A`
3. Moderator B versucht, neue Session `1234` mit Token `token-B` zu starten
4. Expected: Server sendet `ROOM_EXISTS`, Client generiert neue ID und versucht erneut
5. Actual: Server sendet `INVALID_TOKEN`, Client navigiert zur LandingPage mit Fehlermeldung "Session nicht gefunden oder abgelaufen. Bitte überprüfe deine Moderatoren-URL."

## Nebeneffekt: Toter Code

`ModeratorView.tsx` Zeilen 26–37 und 120–123 behandeln `ROOM_EXISTS` – dieser Code kann nie mehr ausgeführt werden. BUG-FEAT1-QA-013 (stille Navigation nach Retry-Erschöpfung) ist damit de facto gegenstandslos, weil der Retry nie startet.

## Priority

Fix before release
