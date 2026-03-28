# BUG-FEAT2-QA-005: ArrayBuffer-Nachrichten werden mit leerem String geparst – potentieller Server-Crash

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung
Im Server (`timer.ts`) wird bei `onMessage` für `ArrayBuffer`-Nachrichten ein leerer String an `JSON.parse` übergeben:

```typescript
// timer.ts Zeile 72-75
cmd = JSON.parse(typeof message === 'string' ? message : '') as { ... };
```

`JSON.parse('')` wirft einen `SyntaxError`. Der `try/catch`-Block fängt diesen zwar auf, aber das Muster ist semantisch falsch: Ein `ArrayBuffer` wird stillschweigend ignoriert, anstatt korrekt als "nicht unterstützter Nachrichtentyp" behandelt zu werden.

In der Praxis senden Browser-WebSocket-Clients selten ArrayBuffer, aber PartyKit-Dokumentation erlaubt es. Falls ein Client (z.B. ein Drittanbieter-Tool oder ein Bot) binary Nachrichten sendet, wird der Fehler gecatcht und nichts passiert – funktionell akzeptabel, aber der Code signalisiert fälschlicherweise "ArrayBuffer ist ein leerer JSON-String".

## Betroffene Datei(en)
- `projekt/src/party/timer.ts` Zeile 72–75

## Steps to Reproduce / Nachweis
```typescript
// timer.ts Zeile 71-78
let cmd: { type: string; durationMs?: number };
try {
  cmd = JSON.parse(typeof message === 'string' ? message : '') as {
    // '^^ ArrayBuffer → '' → JSON.parse('') → SyntaxError → caught → return
    type: string;
    durationMs?: number;
  };
} catch {
  return; // Silently ignored
}
```

Kein Crash, aber semantisch falsch. Bei einem zukünftigen Refactor könnte jemand den `catch`-Block entfernen und dann crasht der Server bei ArrayBuffer-Eingaben.

## Expected
ArrayBuffer-Nachrichten werden explizit abgelehnt (früher Return) ohne JSON.parse-Versuch.

## Actual
ArrayBuffer wird als leerer String an JSON.parse übergeben, SyntaxError wird gefangen, silent ignore.

## Fix-Hinweis
```typescript
if (typeof message !== 'string') return; // ArrayBuffer explizit ignorieren
```
Diese Zeile vor den `JSON.parse`-Call stellen und den ternären Operator entfernen.

## Priority
Nice-to-have
