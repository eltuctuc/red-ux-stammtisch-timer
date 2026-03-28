# BUG-FEAT2-UX-002: aria-live="polite" auf sekündlich aktualisiertem Timer – Screen Reader extrem störend

- **Feature:** FEAT-2 – Timer
- **Severity:** High
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Persona:** Beide
- **Status:** Fixed

## Beschreibung
In `TimerDisplay.tsx` (Zeilen 49–62) ist das `<time>`-Element mit `aria-live="polite"` annotiert,
während der Timer läuft:

```tsx
<time
  role="timer"
  aria-live={ariaLive}  // 'polite' wenn status !== 'expired'
  aria-label={`Verbleibende Zeit: ${label}`}
  ...
>
  {label}
</time>
```

Das `aria-live`-Attribut auf einem Element, das sich jede Sekunde ändert, führt dazu,
dass ein Screen Reader jede Sekunde die aktuelle Zeit vorliest (z. B. "Verbleibende Zeit:
09:47", eine Sekunde später "Verbleibende Zeit: 09:46", usw.).

Das macht die gesamte Anwendung für Screenreader-Nutzer während eines laufenden Timers
unbenutzbar – der Screen Reader liest kontinuierlich vor und übertönt alle anderen Inhalte
und Ankündigungen.

Die FEAT-2-Spec schreibt zwar `aria-live="polite"` vor, meint damit aber wahrscheinlich
periodische Updates (z. B. alle 60 Sekunden), nicht jede Sekunde.
Die korrekte ARIA-Praxis für `role="timer"` ist: kein `aria-live` auf dem Timer selbst;
stattdessen nur Status-Änderungen (Start, Pause, expired) per `role="alert"` oder
`aria-live="assertive"` auf einem separaten Announcement-Element ankündigen.

## Betroffene Datei(en)
- `projekt/src/components/TimerDisplay.tsx`

## Expected (aus Nutzerperspektive)
Ein Screenreader-Nutzer kann die Anwendung normal bedienen. Der Timer wird nicht jede
Sekunde vorgelesen. Wichtige Zustandsänderungen (Timer gestartet, pausiert, abgelaufen)
werden diskret angekündigt.

## Actual
Bei laufendem Timer liest der Screen Reader jede Sekunde den aktuellen Zählerstand vor.
Das macht die Anwendung für sehbehinderte Nutzer praktisch unnutzbar während der Timer läuft.

## Fix-Hinweis
`aria-live` vom `<time>`-Element entfernen. Stattdessen ein verstecktes
`aria-live="polite"`-Ankündigungs-Element einführen, das nur bei Zustandsänderungen
(Start, Pause, Expired) eine einmalige Nachricht erhält, z. B. "Timer gestartet: 10 Minuten",
"Timer pausiert", "Zeit abgelaufen". Für expired: `aria-live="assertive"` beibehalten.
`role="timer"` auf dem `<time>`-Element kann erhalten bleiben – es signalisiert dem
Screenreader, dass das Element einen Timer darstellt, ohne zwingend jede Änderung vorzulesen.

## Priority
Fix before release
