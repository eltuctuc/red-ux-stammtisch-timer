# BUG-FEAT1-QA-009: ParticipantView zeigt "Session nicht gefunden" für alle Fehlerarten – INVALID_TOKEN-Fehler wird falsch angezeigt

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Steps to Reproduce
1. Jemand ruft manuell die URL `/session/1234?mod=wrong-token-but-no-mod-param` auf – wait, das ist ModeratorView.
2. Alternativ: Angreifer versucht eine Session-URL ohne Token (`/session/1234`) bei einer Session, die SESSION_NOT_FOUND zurückgibt. Das ist korrekt gehandelt.

Echter Reproduce-Fall:
1. Moderator ruft `/session/1234?mod=correcttoken` auf (ModeratorView)
2. Ein Netzwerkfehler tritt auf, Socket reconnected
3. Inzwischen hat ein anderer Moderator die gleiche Session übernommen (theoretisch, falls Session-Kollision)
4. Server sendet `ROOM_EXISTS` → ModeratorView handelt das korrekt
5. Aber: Server kann auch generische Fehler senden

Eigentlicher Bug: `ParticipantView.tsx` Z.57 behandelt `if (connectionError)` ohne den `code` zu prüfen. Jeder beliebige Fehlercode (auch `ROOM_EXISTS`, `INVALID_TOKEN`, `UNKNOWN`) zeigt die Nachricht "Session nicht gefunden." an.

In der Praxis: Wenn der Server einen unerwarteten Fehlercode sendet (oder zukünftig neue Codes eingeführt werden), sieht der Teilnehmer immer "Session nicht gefunden" – auch wenn die Session existiert und ein Verbindungsproblem vorliegt.

## Technischer Nachweis

```typescript
// ParticipantView.tsx Zeile 57: kein Code-Check
if (connectionError) {
  return (
    // Zeigt immer: "Session nicht gefunden. Diese Session existiert nicht oder ist abgelaufen."
  );
}
```

Für Teilnehmer existiert nur `SESSION_NOT_FOUND` als erwarteter Fehlercode (da kein Token mitgeschickt wird, kann `INVALID_TOKEN` nicht auftreten). Dennoch ist die fehlende Unterscheidung ein Robustheitsproblem: Netzwerkfehler und Session-Fehler sehen gleich aus.

## Vergleich mit ModeratorView
`ModeratorView.tsx` unterscheidet korrekt zwischen `INVALID_TOKEN`, `ROOM_EXISTS` und implizit `SESSION_NOT_FOUND` (nicht explizit behandelt, fällt aber durch alle Checks – Bug: würde auf dem Moderator-Screen keinen Fehler zeigen, sondern einfach eine leere/connecting Session).

## Priority
Fix before release
