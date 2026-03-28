# BUG-FEAT1-QA-013: Nach Erschöpfung der ROOM_EXISTS-Retries – stille Navigation zur LandingPage ohne Fehlermeldung

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung

In `ModeratorView.tsx` (Zeile 33-35) wird nach 3 erfolglosen `ROOM_EXISTS`-Retries zur LandingPage navigiert:

```typescript
} else {
  navigate('/', { replace: true });
}
```

Diese Navigation übergibt keinen `state` an die LandingPage (kein `reconnectError`). Der Nutzer sieht die leere LandingPage ohne jede Erklärung, warum die Session-Erstellung fehlgeschlagen ist.

## Steps to Reproduce

**Primärer (theoretischer) Fall – echter Kollisions-Erschöpfungs-Fall:**
1. Klick auf "Neue Session starten"
2. Alle generierten Session-IDs kollidieren 3× hintereinander
3. Nach dem 3. Retry: Redirect zur LandingPage ohne Fehlermeldung

**Sekundärer (praktischer) Fall – via BUG-FEAT1-QA-011:**
1. Moderator gibt eine URL mit falschem Token ein
2. Server antwortet 3× mit ROOM_EXISTS (eine neue Session pro Retry)
3. Redirect zur LandingPage ohne Fehlermeldung

Expected: Fehlermeldung auf der LandingPage, z.B. "Session konnte nicht erstellt werden. Bitte versuche es erneut."
Actual: Leere LandingPage ohne Feedback

## Einschränkung

Der primäre Fall (echter Kollisions-Erschöpfung bei 9000 möglichen IDs) ist statistisch extrem unwahrscheinlich. Die praktische Relevanz entsteht erst durch BUG-FEAT1-QA-011 (falscher Token löst ROOM_EXISTS aus).

## Priority
Nice-to-have
