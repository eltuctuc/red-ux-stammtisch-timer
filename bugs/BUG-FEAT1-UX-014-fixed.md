# BUG-FEAT1-UX-014: ModeratorView zeigt "00:00" während Verbindungsaufbau – UX-010-Fix nicht übertragen

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Feedback
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Fixed – 2026-03-28 – ModeratorView.tsx Z.53: displayMs zeigt null wenn connecting && !timerState

## Beschreibung

BUG-FEAT1-UX-010 wurde für `ParticipantView` korrekt behoben: `displayMs = null` während `connecting` ohne `timerState`, `TimerDisplay` zeigt "--:--".

Der identische Zustand existiert jedoch in `ModeratorView.tsx` unverändert:

```tsx
const displayMs = timerState?.displayRemainingMs ?? 0;
```

Wenn die ModeratorView lädt und die WebSocket-Verbindung noch aufgebaut wird (`connectionStatus === 'connecting'`, `timerState === null`), fällt `displayMs` auf `0` zurück. Der Timer zeigt "00:00" im Idle-Zustand.

Das Problem trifft Mia beim Reconnect-Szenario besonders hart: Sie öffnet ihre Moderatoren-URL nach einer Pause – der laufende Timer zeigt für ~200–500ms "00:00" bevor der echte State vom Server kommt. Das kann sie dazu verleiten, den Timer erneut zu starten, obwohl er noch läuft.

## Steps to Reproduce

1. Moderator öffnet die Moderatoren-URL auf einem langsamen Netz (z.B. Fast 3G in DevTools)
2. Beobachte den Timer-Bereich in den ersten Millisekunden nach dem Seitenaufruf
3. Expected: Timer zeigt "--:--" oder einen neutralen Loading-Zustand bis die Verbindung steht (identisch zu ParticipantView nach UX-010-Fix)
4. Actual: Timer zeigt "00:00" im Idle-Zustand bis der State vom Server kommt

## Empfehlung

`ModeratorView.tsx` Zeile 53 analog zu `ParticipantView.tsx` anpassen:

```tsx
const displayMs = connectionStatus === 'connecting' && !timerState
  ? null
  : (timerState?.displayRemainingMs ?? 0);
```

`TimerDisplay` akzeptiert bereits `displayMs: number | null` – kein Änderungsbedarf dort.

## Priority

Fix before release
