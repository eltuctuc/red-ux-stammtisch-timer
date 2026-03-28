# BUG-FEAT1-QA-020: `modToken` nicht in Storage persistiert – Durable Object Restart löscht Moderatoren-Authentifizierung

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Security
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung

In `timer.ts` wird `this.state.modToken` ausschließlich als In-Memory-Klassenvariable gespeichert (Constructor Zeile 28-34). Es existiert kein `onStart()`/`onLoad()`-Hook der den Token aus dem Durable-Object-Storage lädt. Einzig der `expired`-Flag wird in `room.storage` persistiert (Zeile 209).

**Was bei einem Durable Object Restart passiert:**

PartyKit Durable Objects können von der Runtime beendet und neugestartet werden (Deployments, Inaktivitäts-Hibernate, Infrastructure-Events). Nach einem Neustart:

1. Constructor wird erneut ausgeführt: `modToken: null, timer: defaultTimerState()`
2. `modConnections = new Set()` (leer)
3. Ein neuer Connect-Versuch mit einem beliebigen Token trifft auf `this.state.modToken === null`
4. → Branch 1 (Zeile 51-57): Token wird als neuer erster Moderator akzeptiert
5. Der ursprüngliche Moderator verliert seine exklusive Kontrolle

**Konsequenz:**
- Jeder der eine Session-Nummer kennt (öffentlich teilbar), kann nach einem DO-Restart mit einem beliebigen Token die Moderatoren-Rechte übernehmen
- Der legitime Moderator erhält beim Reconnect-Versuch `INVALID_TOKEN`, weil ein Angreifer bereits "erster Moderator" wurde
- Der Timer-State (`timerState`) wird ebenfalls zurückgesetzt auf `defaultTimerState()` – laufende Timer gehen verloren

**Sekundärer Effekt:** Der `modConnections`-Set wird nach jedem Restart leer. Alle bestehenden Verbindungen (falls PartyKit Connections über Hibernation persistiert) können keine Befehle mehr senden, da `modConnections.has(sender.id)` false ergibt. Dies trifft jedoch nicht ein wenn Verbindungen beim Restart geschlossen werden.

## Steps to Reproduce

1. Moderator startet Session `1234` mit Token `token-A`
2. PartyKit Durable Object für Room `1234` wird restartet (z.B. nach Deployment)
3. Angreifer kennt Session-Nummer `1234` (öffentlich)
4. Angreifer connectet mit beliebigem Token `evil-token`
5. Expected: Server sendet `INVALID_TOKEN` (der ursprüngliche `token-A` ist noch gesetzt)
6. Actual: Server akzeptiert `evil-token` als neuen Moderator-Token (da `modToken === null` nach Restart)

## Betroffene Datei

`projekt/src/party/timer.ts` – Zeilen 28-34: Constructor setzt `modToken: null` ohne Storage-Load

## Fix-Hinweis

`modToken` sollte beim ersten Setzen in `room.storage` persistiert werden:
```typescript
await this.room.storage.put('modToken', tokenParam);
```

Und beim Connect aus Storage geladen werden (via `onStart()`/`onConnect()` vor der Token-Prüfung):
```typescript
const storedToken = await this.room.storage.get<string>('modToken');
if (storedToken) this.state.modToken = storedToken;
```

## Priority

Fix before release
