# BUG-FEAT2-QA-012: ParticipantView zeigt "Warten auf nächsten Timer…" auch nach RESET – nicht nur bei frisch joinenden Teilnehmern

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed
- **Fixed on:** 2026-03-29

## Steps to Reproduce
1. Moderator startet 5-Minuten-Timer
2. Teilnehmer sieht laufenden Timer (korrekt)
3. Moderator klickt "Zurücksetzen"
4. Server sendet `STATE_UPDATE { status: 'idle', totalDurationMs: 300000, remainingMs: 300000 }`
5. ParticipantView rendert: `status === 'idle' && timerState !== null`

Expected: Teilnehmer sieht nach einem Reset idealerweise die ursprüngliche Dauer (5:00) oder einen neutralen Idle-State, der signalisiert dass der Moderator die Timebox zurückgesetzt hat und gleich neu startet.
Actual: Teilnehmer sieht "Warten auf nächsten Timer…" – obwohl der Timer auf 5:00 gesetzt und jederzeit startbereit ist. Das ist inhaltlich falsch: Es gibt bereits einen konfigurierten Timer, es wird auf keinen "nächsten" Timer gewartet, sondern auf den Start des vorhandenen.

## Technischer Nachweis

```tsx
// ParticipantView.tsx Zeile 120-131
{status === 'idle' && timerState !== null && (
  <p aria-live="polite" ...>
    Warten auf nächsten Timer…
  </p>
)}
```

Die Bedingung unterscheidet nicht zwischen:
- `idle` mit `totalDurationMs === 0` (frisch gejoint, kein Timer konfiguriert)
- `idle` mit `totalDurationMs > 0` (Timer nach Reset, Dauer bereits gesetzt)

Im zweiten Fall ist der Text irreführend. "Warten auf nächsten Timer" suggeriert, dass der aktuelle Timer-Lauf beendet ist und ein komplett neuer kommt. Das ist nach einem RESET semantisch korrekt, aber nach einem einfachen Pause→Reset-Zyklus während einer Timebox irritierend.

Ein weiterer Fall: Nach Session-Join während idle mit gesetzter Dauer (Moderator hat Preset gewählt aber noch nicht gestartet) sieht der Teilnehmer "Warten auf nächsten Timer…" – obwohl der Timer bei 05:00 steht. Die 05:00 ist für den Teilnehmer nicht sichtbar (kein Preset-Anzeige in ParticipantView), also ist der Hinweistext die einzige Information – und er ist ungenau.

## Expected
Unterscheidung:
- `idle` + `totalDurationMs === 0`: "Warten auf nächsten Timer…" (korrekt)
- `idle` + `totalDurationMs > 0`: Timer zeigt die konfigurierte Dauer (MM:SS), kein irreführender Text oder ein alternativer Text wie "Timer bereit" / "Gleich geht's los"

## Actual
Einheitliche Meldung "Warten auf nächsten Timer…" für alle idle-Zustände, unabhängig davon ob eine Dauer konfiguriert ist.

## Priority
Fix before release

**Fix:** ParticipantView.tsx – 'Warten auf nächsten Timer…' nur bei totalDurationMs === 0 anzeigen.
