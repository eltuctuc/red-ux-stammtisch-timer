# BUG-FEAT1-QA-018: PartySocket Auto-Reconnect sendet `?new=1` bei Netzwerkunterbrechung erneut

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung

`useTimerSession.ts` setzt den `isNew`-Parameter als fixen `query`-Wert beim Erstellen des PartySocket-Objekts (Zeile 114-116):

```typescript
if (isNew) {
  query.new = '1';
}
```

PartySocket hat einen eingebauten Auto-Reconnect-Mechanismus. Wenn die WebSocket-Verbindung unterbrochen wird (Netzwerkfehler, Tab in Hintergrund geschickt), baut PartySocket automatisch eine neue Verbindung auf – mit denselben `query`-Parametern, also mit `?new=1`.

**Aktuelle Server-Logik (timer.ts):** Der Branch `tokenParam === modToken` (Zeile 58) greift vor `isNewSession` (Zeile 61). Deshalb wird ein Auto-Reconnect mit korrektem Token und `?new=1` korrekt behandelt.

**Risiko:** Die Korrektheit des Auto-Reconnects hängt implizit von der Branch-Reihenfolge in `timer.ts` ab. Dieser Zusammenhang ist nicht dokumentiert. Ein zukünftiger Refactor, der die Branch-Reihenfolge ändert (z.B. `isNewSession` zuerst prüfen), würde alle laufenden Moderatoren-Sessions nach einem Netzwerk-Reconnect mit ROOM_EXISTS-Error beenden – ein stiller, schwer reproduzierbarer Bug.

## Steps to Reproduce

1. Moderator startet neue Session (URL enthält `?new=1`)
2. Timer läuft
3. Moderator trennt kurz Netzwerkverbindung (Flugzeugmodus an/aus)
4. PartySocket reconnectet automatisch mit `?new=1`
5. Expected: Reconnect erfolgreich, Timer-State synchronisiert
6. Actual (derzeit): Funktioniert korrekt – aber nur weil Branch-Reihenfolge passt

## Betroffene Datei

- `projekt/src/hooks/useTimerSession.ts` Zeilen 113-116

## Fix-Hinweis

`query.new = '1'` sollte nur beim initialen Connect gesetzt werden, nicht bei Auto-Reconnects. Da PartySocket den `query`-Parameter statisch hält, wäre die sicherste Lösung: Nach dem ersten STATE_UPDATE (Session confirmed) aus der URL-Bar und dem Hook-State `?new=1` entfernen (koppelt mit BUG-FEAT1-QA-017).

## Priority

Nice-to-have
