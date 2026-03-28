# BUG-FEAT1-QA-019: `SET_DURATION` mit `durationMs: NaN` – Clamp-Validierung schlägt durch

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Security
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung

In `timer.ts` (Zeile 111-119) wird `durationMs` für den `SET_DURATION`-Command folgendermaßen validiert:

```typescript
case 'SET_DURATION': {
  const raw = cmd.durationMs ?? 0;
  // Clamp to [1000, 5_999_000] ms (1s – 99:59)
  const durationMs = Math.min(5_999_000, Math.max(1_000, raw));
  ...
}
```

**Problem:** `Math.min` und `Math.max` mit `NaN` als Argument liefern immer `NaN` zurück:
- `Math.max(1_000, NaN)` → `NaN`
- `Math.min(5_999_000, NaN)` → `NaN`

Wenn ein Angreifer oder fehlerhafter Client `{ type: "SET_DURATION", durationMs: NaN }` sendet, wird `this.state.timer.totalDurationMs = NaN` und `this.state.timer.remainingMs = NaN` gesetzt. Daraufhin empfangen alle Clients `STATE_UPDATE` mit `remainingMs: NaN`.

**Auswirkungen:**
- `formatTime(NaN)` → `NaN:NaN` als Timer-Anzeige für alle Clients
- `isWarning`-Berechnung in `useTimerSession.ts` Zeile 174: `displayRemainingMs <= totalDurationMs * 0.2` → `NaN <= NaN` → `false` (kein kritischer Fehler, aber falsches Verhalten)
- Der Timer kann aus dem `NaN`-State nicht mehr normal benutzt werden; `START` schlägt fehl weil `timer.status === 'idle'` weiterhin möglich ist, aber `remainingMs = NaN`

Auch `null` ist möglich: `{ type: "SET_DURATION", durationMs: null }` → `null ?? 0` → `0` → wird zu `1000` (Clamp greift, kein Bug). Aber `undefined` → `undefined ?? 0` → `0` → korrekt.

**Angriffsszenario:** Nur ein verifizierter Moderator (`modConnections.has(sender.id)`) kann Befehle senden. Ein Angreifer müsste also zuerst die Moderatoren-URL kennen. Bei Security-by-Obscurity-Design ist das der relevante Angriffsvektor: Jemand der die Moderatoren-URL erschnüffelt hat, könnte den Timer einer laufenden Session dauerhaft zerstören.

## Steps to Reproduce

1. WebSocket-Verbindung zur Session als Moderator aufbauen (mit gültigem Token)
2. Senden: `{ "type": "SET_DURATION", "durationMs": null }` → Clamp greift, `1000` ms gesetzt ✅
3. Senden: `{ "type": "SET_DURATION", "durationMs": "abc" }` → TypeScript-Typ-Guard greift nicht im Runtime, `"abc" ?? 0` = `"abc"` → `Math.max(1000, "abc")` = `NaN` ❌
4. Oder: Direkt `{ "type": "SET_DURATION", "durationMs": NaN }` (via JSON erlaubt als Zahl, obwohl NaN in JSON nicht valide ist – Parser würde es verwerfen)
5. Expected: Server verwirft ungültige Eingaben, Timer bleibt in validem Zustand
6. Actual: `NaN` führt zu korruptem Timer-State der an alle Clients gebroadcastet wird

## Technische Details

JSON kann `NaN` nicht direkt repräsentieren – `JSON.parse('{"durationMs":NaN}')` ist ein Syntaxfehler. Das reduziert das praktische Risiko erheblich. Der Angriff via reinen JSON-String schlägt fehl. **Jedoch:** Eine fehlerhafte oder bösartige Client-Implementierung könnte einen String wie `"abc"` senden, der durch `cmd.durationMs` als `string` durchkommt (TypeScript-Typ wird zur Laufzeit nicht geprüft). `Math.max(1_000, "abc" as unknown as number)` = `NaN`.

## Betroffene Datei

- `projekt/src/party/timer.ts` Zeile 111: fehlende `Number.isFinite()`-Prüfung

## Fix-Hinweis

```typescript
const raw = typeof cmd.durationMs === 'number' && Number.isFinite(cmd.durationMs)
  ? cmd.durationMs
  : 0;
```

## Priority

Fix before release
