# BUG-FEAT1-QA-021: URL-Cleanup (QA-017-Fix) triggert WebSocket-Reconnect durch geänderte `isNew`-Dependency

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Functional / Regression
- **Gefunden von:** QA Engineer (Re-QA Bug-Fix-Runde 5)
- **Status:** Open

## Beschreibung

Der QA-017-Fix in `ModeratorView.tsx` entfernt `?new=1` aus der Browser-URL, sobald `connectionStatus === 'connected' && isNew === true` gilt. Das geschieht via `navigate(..., { replace: true })` – korrekt so weit.

**Das Problem:** `useTimerSession` (Zeile 165) hat `isNew` im Dependency-Array:

```typescript
}, [sessionId, modToken, isNew]);
```

Wenn der QA-017-`navigate`-Call die URL von `.../session/1234?mod=TOKEN&new=1` auf `.../session/1234?mod=TOKEN` ändert, rendert `SessionPage` neu. `isNew` wechselt von `true` auf `false`. React erkennt die geänderte Dependency → der WebSocket-useEffect in `useTimerSession` läuft neu durch: Bestehende PartySocket-Instanz wird geschlossen (`socket.close()`), eine neue Instanz wird erstellt.

**Folge:**
1. `connectionStatus` wechselt auf `'disconnected'` dann auf `'connecting'`
2. `ConnectionIndicator` wird kurz sichtbar (Verbindungsanzeige blinkt auf)
3. Alle UI-Controls sind für den Moment der neuen Verbindung disabled (`controlsDisabled = connectionStatus !== 'connected'`)
4. Ein zweiter Connect-Roundtrip wird zum Server geschickt – unnötiger Overhead

Der zweite Connect ist funktional korrekt: Er landet im `tokenParam === modToken`-Branch (kein `?new=1`), bekommt `STATE_UPDATE` zurück, und die Session läuft weiter. Es gibt keinen Datenverlust. Aber der kurze "Blinker" in der UI ist unerwünscht und der doppelte Connect ist unnötiger Server-Traffic.

## Steps to Reproduce

1. Haupt-URL öffnen, "Neue Session starten" klicken
2. Redirect zu `/session/1234?mod=TOKEN&new=1`
3. Verbindung wird hergestellt → `connectionStatus === 'connected'`
4. QA-017-Effect feuert → navigate zur sauberen URL `/session/1234?mod=TOKEN`
5. Expected: URL wird bereinigt, Verbindung bleibt stabil, keine UI-Unterbrechung
6. Actual: `isNew`-Dependency-Änderung triggert WebSocket-Teardown + Neuaufbau → ConnectionIndicator blinkt kurz auf → Controls kurz disabled

## Ursache

`isNew` ist im `useEffect`-Dependency-Array von `useTimerSession` enthalten, weil es als `query`-Parameter an PartySocket übergeben wird. Die `useEffect`-Logik ist korrekt – aber der QA-017-Fix erzeugt als Nebeneffekt eine Dependency-Änderung, die einen vollständigen WebSocket-Teardown auslöst.

## Betroffene Dateien

- `projekt/src/hooks/useTimerSession.ts` Zeile 165: `isNew` im Dependency-Array
- `projekt/src/components/ModeratorView.tsx` Zeile 27–31: QA-017-Cleanup-Effect

## Fix-Hinweis

Zwei mögliche Ansätze:

**Option A (minimal):** Den `navigate`-Call aus dem `useEffect` herausnehmen und stattdessen in `SessionPage` nach erfolgreicher Verbindung die URL bereinigen – ohne `isNew` als `useTimerSession`-Prop durchzureichen. Wenn `isNew` nicht als Hook-Parameter existiert, entfällt die Dependency-Änderung.

**Option B (robuster):** `useTimerSession` stabilisieren: `isNew` aus dem Dependency-Array entfernen und stattdessen als Ref speichern, der nur beim initialen Mount verwendet wird. Da `isNew` nach dem ersten Connect irrelevant wird, ist die reaktive Dependency auf `isNew` ohnehin semantisch falsch.

## Priority

Fix before release
