# BUG-FEAT1-QA-006: ROOM_EXISTS-Retry ohne Abbruchbedingung – potenzielle Endlos-Redirect-Schleife

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Steps to Reproduce
1. Moderator klickt "Neue Session starten" auf der Landing Page
2. Frontend generiert zufällig eine sessionId, die mit einer bestehenden Session kollidiert
3. Server sendet `{ type: 'ERROR', code: 'ROOM_EXISTS' }`
4. `ModeratorView.tsx` useEffect (Z.23-29) erkennt ROOM_EXISTS und navigiert zu neuer zufälliger ID
5. Die neue zufällige ID kollidiert ebenfalls (unwahrscheinlich, aber bei ~1 % Auslastung möglich)
6. Erneut ROOM_EXISTS → erneute Navigation → erneuter Connect → erneute Kollision
7. Expected: Nach maximal N Retries wird der User mit einer Fehlermeldung informiert
8. Actual: Unendliche navigate-Schleife ohne Abbruchbedingung; Browser-History füllt sich (replace:true verhindert History-Bloat, aber CPU-Last durch ständige Re-Mounts)

## Technischer Nachweis

```typescript
// ModeratorView.tsx Zeile 23-29
useEffect(() => {
  if (connectionError?.code === 'ROOM_EXISTS') {
    const newSessionId = generateSessionId();
    const newModToken = generateModToken();
    navigate(`/session/${newSessionId}?mod=${newModToken}`, { replace: true });
    // Kein Retry-Counter, kein Abbruch, kein User-Feedback
  }
}, [connectionError, navigate]);
```

Das Tech-Design spezifiziert explizit "max. 3 Versuche" (FEAT-1.md, Abschnitt Tech-Entscheidungen: "Kollision wird beim Connect erkannt … Frontend generiert neue ID"). Drei Versuche sind nicht implementiert.

Bei 9000 möglichen Session-IDs und z.B. 90 aktiven Sessions (1 % Auslastung) liegt die Wahrscheinlichkeit einer Doppelkollision bei ca. 0,01 % – selten, aber bei wachsender Nutzerzahl realistisch.

## Priority
Fix before release
