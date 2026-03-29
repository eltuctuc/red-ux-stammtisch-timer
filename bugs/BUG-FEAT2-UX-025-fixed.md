# BUG-FEAT2-UX-025: TimerDisplay aria-live="assertive" auch für Pause-Announcement zu aggressiv

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Fixed – 2026-03-29

## Problem

`TimerDisplay.tsx` verwendet für alle Status-Ankündigungen (expired + paused) einen einzigen `aria-live="assertive"`-Container (Z.58-73):

```tsx
<span
  aria-live="assertive"
  aria-atomic="true"
  style={{ /* visually hidden */ }}
>
  {announcement}
</span>
```

`aria-live="assertive"` unterbricht den Screenreader-Lesefluss sofort – auch mitten in einem laufenden Vorlesen. Das ist für den `expired`-Zustand korrekt und intentionell (laut FEAT-2-Spec: `aria-live="assertive"` für sofortige Ankündigung bei Ablauf).

Aber: wenn der Moderator den Timer pausiert (`status → 'paused'`), wird ebenfalls `assertive` ausgelöst. Die Pause ist eine Routineaktion des Moderators selbst – hier ist die sofortige Unterbrechung des Screenreader-Flusses nicht gerechtfertigt. Der Moderator weiß, was er gerade getan hat. Für Teilnehmer (ParticipantView nutzt dieselbe TimerDisplay-Komponente) kann die aggressive Unterbrechung beim Lesen anderer Inhalte störend sein.

Die FEAT-2-Spec definiert explizit:
> "bei expired-Zustand aria-live='assertive' für sofortige Ankündigung"

Das impliziert, dass andere Zustände mit `polite` ausreichen würden.

WCAG 4.1.3 (Status Messages, AA): Status-Meldungen sollen programmatisch bestimmbar sein, aber die Dringlichkeit des `aria-live`-Levels soll der tatsächlichen Kritikalität entsprechen. Eine Pause-Meldung ist nicht kritisch genug für `assertive`.

## Steps to Reproduce

1. Screenreader aktivieren
2. Auf der Teilnehmer-Ansicht den Timer laufen sehen
3. Moderator pausiert Timer während der Screenreader-Nutzer gerade einen anderen Textinhalt liest
4. Expected: Screenreader liest nach dem aktuellen Satz/Abschnitt "Timer pausiert" vor (polite)
5. Actual: Screenreader unterbricht sofort die aktuelle Ansage und liest "Timer pausiert" assertive – unnötige Disruption für eine Routineaktion

## Empfehlung

Zwei getrennte live-regions verwenden – eine `assertive` exklusiv für `expired`, eine `polite` für `paused`:

```tsx
{/* Nur für expired – assertive Unterbrechung gerechtfertigt */}
<span
  aria-live="assertive"
  aria-atomic="true"
  style={{ /* visually hidden */ }}
>
  {status === 'expired' ? 'Zeit abgelaufen' : ''}
</span>

{/* Für paused – polite, unterbricht nicht */}
<span
  aria-live="polite"
  aria-atomic="true"
  style={{ /* visually hidden */ }}
>
  {status === 'paused' ? 'Timer pausiert' : ''}
</span>
```

Der `announcement`-State und `useEffect` entfallen dann; die Logik ist direkt im JSX deklarativ und damit klarer.

## Priority
Fix before release
