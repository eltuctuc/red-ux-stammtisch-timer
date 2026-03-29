# BUG-FEAT2-UX-015: Kein visuelles Hover/Focus-Feedback auf Preset-Buttons (nur opacity bei disabled)

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** UX / Interaktionsmuster
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Die Preset-Buttons in `PresetButtons.tsx` haben keinen definierten Hover-Zustand in der Inline-Style-Logik. Das globale CSS in `index.css` liefert nur `focus-visible`-Styling. Hover-Zustandsänderungen (Hintergrundfarbe, Border-Farbe) sind nicht implementiert. Im Vergleich zu anderen Buttons in der App (z.B. ShareSection-Toggle mit `onMouseEnter/onMouseLeave`) fehlt hier das visuelle Feedback komplett.

Für Maus-Nutzer gibt es kein Signal, dass der Button klickbar ist, außer dem `cursor: pointer`. Das ist besonders auffällig bei den inaktiven (nicht-selected) Preset-Buttons, die auf einem hellen Hintergrund liegen.

## Steps to Reproduce

1. Moderatoren-Ansicht öffnen
2. Maus über einen Preset-Button (z.B. "5 Min") bewegen
3. Expected: Leichte Hintergrundänderung oder Border-Aufhellung als Hover-Feedback
4. Actual: Kein visueller Unterschied zu normalem Zustand – Button wirkt statisch

## Empfehlung

Einen `isHovered`-State per Button ergänzen oder CSS-Klassen nutzen. Alternativ `onMouseEnter/onMouseLeave` wie im ShareSection-Toggle implementieren. Eine minimale Hintergrundänderung (z.B. `var(--color-bg)` statt `var(--color-surface)`) reicht.

Für den aktiven (selected) Preset-Button: leichte Aufhellung von `--color-accent` zum Hover-Feedback, analog zur Button-Hover-Konvention der App.

## Priority
Nice-to-have
