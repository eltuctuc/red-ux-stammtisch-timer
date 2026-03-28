# BUG-FEAT2-UX-001: Timer im "paused"-Zustand visuell nicht von "running" unterscheidbar

- **Feature:** FEAT-2 – Timer
- **Severity:** High
- **Bereich:** UX | Feedback | Konsistenz
- **Gefunden von:** UX Reviewer
- **Persona:** Tom (Teilnehmer)
- **Status:** Fixed

## Beschreibung
In `TimerDisplay.tsx` (Zeilen 11–23) sind die Farb-Maps für den Timer so definiert,
dass `'paused'` exakt dasselbe Styling bekommt wie `'running'`:

```typescript
const bgMap: Record<TimerStatus, string> = {
  idle:    'var(--timer-bg-running)',
  running: 'var(--timer-bg-running)',
  paused:  'var(--timer-bg-running)',  // identisch mit running
  expired: 'var(--timer-bg-expired)',
};
```

Wenn der Moderator den Timer pausiert, sieht Tom (Teilnehmer) in seiner `ParticipantView`
eine eingefrorene Zeitanzeige – aber der visuelle Zustand des Timer-Blocks bleibt identisch
mit dem laufenden Timer. Tom weiß nicht ob der Timer pausiert wurde, ob die Verbindung
unterbrochen ist, oder ob die Zeit einfach zufällig gerade steht.

Dies ist ein direktes Kriterium aus dem Problem Statement: "Kein Teilnehmer fragt während
einer Timebox nach der verbleibenden Zeit." – Wenn Tom nicht sieht ob der Timer läuft,
wird er genau das tun.

Laut FEAT-2 UX-Spec:
> *"Timer läuft → Pause → Countdown stoppt, 'Resume'-Button erscheint"*
Der Spec beschreibt den Resume-Button nur in der Moderatoren-Ansicht, aber Tom als
Teilnehmer sieht diesen Button nicht – und bekommt auch sonst keinen visuellen Hinweis.

## Betroffene Datei(en)
- `projekt/src/components/TimerDisplay.tsx`

## Expected (aus Nutzerperspektive)
Tom sieht beim pausierten Timer einen deutlich anderen visuellen Zustand als beim
laufenden Timer – z. B. eine andere Hintergrundfarbe, ein Pause-Icon oder einen
Text-Overlay "Pausiert".

## Actual
`paused` und `running` sind visuell identisch. Einziger Unterschied: Die Zahl
bewegt sich nicht. Für einen Teilnehmer, der kurz weggschaut hat, ist das nicht
von einem Verbindungsproblem oder einem falsch wahrgenommenen Stand zu unterscheiden.

## Fix-Hinweis
Einen eigenen `--timer-bg-paused` Token definieren (z. B. ein dezentes Blau-Grau)
und in `bgMap` und `textMap` für den `paused`-State verwenden. Optional: ein visuelles
Pause-Symbol oder einen Text "Pausiert" innerhalb des `TimerDisplay` für den `paused`-Zustand.
In der ParticipantView könnte ergänzend ein StatusLabel ("Timer läuft" / "Pausiert") erscheinen.

## Priority
Fix before release
