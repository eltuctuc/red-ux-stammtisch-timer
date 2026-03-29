# BUG-FEAT2-UX-019: `prefers-reduced-motion` wird ignoriert – Timer-Hintergrundübergang und Puls-Animation laufen immer

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Fixed
- **Fixed on:** 2026-03-29

## Problem

Zwei Animationen ignorieren `prefers-reduced-motion`:

1. **TimerDisplay.tsx:** Der Hintergrund- und Farbwechsel (running → warning → expired) ist mit `transition: background 200ms ease, color 200ms ease` animiert. Bei aktiviertem Reduced-Motion läuft dieser Übergang trotzdem.

2. **ConnectionIndicator.tsx:** Der Puls-Indikator-Punkt animiert mit `animation: pulse 1.4s ease-in-out infinite`. Diese Endlos-Animation ignoriert `prefers-reduced-motion` vollständig.

Laut WCAG 2.1 Kriterium 2.3.3 (AAA) und WCAG 2.1 Kriterium 2.3.1 (AA für Blink-Animationen > 3Hz) müssen Animationen unter `prefers-reduced-motion: reduce` deaktiviert oder stark reduziert werden. Die 1.4s-Pulsanimation liegt unter 3Hz, aber trotzdem: Nutzer, die Reduced-Motion aktivieren, tun dies explizit wegen Gleichgewichtsstörungen oder vestibulären Problemen.

## Steps to Reproduce

1. System-Einstellung "Bewegung reduzieren" aktivieren (macOS: Systemeinstellungen → Bedienungshilfen → Bewegung)
2. Timer starten, Verbindungsindikator beobachten
3. Expected: Keine Puls-Animation, instantaner Farbwechsel statt Transition
4. Actual: Puls-Animation läuft weiter, Farbübergang animiert weiter

## Empfehlung

In `index.css` ergänzen:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Alternativ gezielt pro Komponente. Das ist der Standard-Ansatz und deckt alle Animationen zentral ab.

## Priority
Fix before release

**Fix:** index.css – @media (prefers-reduced-motion: reduce) Block ergänzt, der alle animations/transitions auf 0.01ms setzt.
