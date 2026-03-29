# BUG-FEAT2-UX-026: Inkonsistente Disabled-Darstellung zwischen primären und sekundären Buttons in TimerControls

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** UX / Konsistenz
- **Gefunden von:** UX Reviewer
- **Status:** Fixed – 2026-03-29

## Problem

`TimerControls.tsx` verwendet zwei verschiedene Disabled-Muster innerhalb derselben Komponente, die gleichzeitig sichtbar sein können:

**Primärer Button (Starten / Pause / Weiter / Nochmal starten) im disabled-Zustand:**
```tsx
background: disabled ? 'var(--color-border)' : 'var(--color-accent)',
color: disabled ? 'var(--color-text-secondary)' : 'white',
// kein opacity-Wert gesetzt
```

**Sekundärer Button (Zurücksetzen) im disabled-Zustand:**
```tsx
opacity: disabled ? 0.5 : 1,
// Farben bleiben unverändert
```

Das ergibt zwei visuell ungleich behandelte disabled-Zustände: Der primäre Button wechselt Farbe (wird grau-flach), der sekundäre Button wird halbtransparent. Wenn beide Buttons gleichzeitig disabled sind (z.B. bei Verbindungsproblem im paused-Zustand: "Weiter"-Button + "Zurücksetzen"-Button), wirken sie wie unterschiedliche Deaktivierungsgründe – obwohl es derselbe Grund ist.

Konsistenz-Prinzip: Gleiche Zustände gleich kommunizieren. WCAG 1.4.1 (Use of Color) und generelles UI-Konsistenzprinzip aus dem FEAT-2-Spec:
> "Primärmuster: Dashboard mit direkten Aktions-Buttons – jede Aktion wirkt sofort"

Nutzer, die beide Buttons deaktiviert sehen, bilden keine einheitliche mentale Kategorie "alle Controls deaktiviert" – weil die visuelle Sprache unterschiedlich ist.

## Steps to Reproduce

1. Moderatoren-Ansicht öffnen mit laufendem Timer und konfigurierter Dauer
2. Netzwerk unterbrechen (connectionStatus != 'connected')
3. Expected: Alle deaktivierten Buttons sehen visuell gleich "deaktiviert" aus
4. Actual: Primärer Button (z.B. "Pause") wirkt grau-flach; sekundärer Button ("Zurücksetzen") wirkt halbtransparent – zwei visuelle Disabled-Signale für denselben Zustand

## Empfehlung

Disabled-Darstellung vereinheitlichen. Bevorzugt: beide Patterns auf `opacity: 0.5` angleichen und auf Farbwechsel beim primären Button im disabled-Zustand verzichten. Oder umgekehrt: beide auf expliziten Farbwechsel umstellen. Wichtig ist Konsistenz, nicht das konkrete Muster.

Die `cursor: 'not-allowed'` ist bei beiden gesetzt – das ist bereits konsistent.

## Priority
Nice-to-have
