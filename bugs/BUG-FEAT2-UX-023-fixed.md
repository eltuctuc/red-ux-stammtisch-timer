# BUG-FEAT2-UX-023: ConnectionIndicator – pulse-Animation ignoriert prefers-reduced-motion trotz globalem CSS-Fix

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y / prefers-reduced-motion
- **Gefunden von:** UX Reviewer
- **Status:** Fixed – 2026-03-29
- **Fix:** `@media (prefers-reduced-motion: reduce) { .connection-dot { animation: none !important; } }` direkt in den inline `<style>`-Tag von `ConnectionIndicator.tsx` ergänzt. Dem Dot-Span `className="connection-dot"` gegeben, damit das Media Query greift.

## Problem

Der Fix für UX-019 in `index.css` setzt global:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

`ConnectionIndicator.tsx` definiert den `@keyframes pulse` jedoch als inline `<style>`-Tag innerhalb der Komponente (Z.73-78):

```tsx
<style>{`
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`}</style>
```

Das globale Media Query setzt `animation-duration: 0.01ms`, aber es unterdrückt die Animation nicht vollständig: Bei `prefers-reduced-motion: reduce` soll die Animation nach WCAG 2.3.3 (Animation from Interactions, AAA) idealerweise komplett deaktiviert werden, nicht nur extrem beschleunigt. Wichtiger noch: der pulsierende Dot wechselt mit 0.01ms weiterhin zwischen opacity 1 und 0.3, was bei manchen Nutzern mit Vestibularstörungen trotzdem Probleme verursachen kann.

Das eigentliche Problem ist die Inline-`<style>`-Technik: Die Animation-Property am Dot-Element lautet `animation: !isError ? 'pulse 1.4s ease-in-out infinite' : 'none'` (Z.43). Die globale Media Query setzt `animation-duration` auf 0.01ms per `!important`, aber das `animation`-Shorthand-Property enthält alle Sub-Properties. Das Verhalten ist Browser-abhängig – in einigen Engines setzt `!important` auf `animation-duration` den Wert korrekt, in anderen hat das Shorthand Vorrang.

Die robuste Lösung für `prefers-reduced-motion` erfordert direktes Targeting der Animation-Eigenschaft – am sichersten durch `animation: none` in der Media Query, nicht nur durch Dauer-Override.

## Steps to Reproduce

1. Browser/OS auf `prefers-reduced-motion: reduce` setzen
2. Session mit Verbindungsunterbrechung simulieren (ConnectionIndicator sichtbar)
3. Expected: Pulsierender Dot zeigt keine Animation oder nur einen statischen Dot
4. Actual: Dot pulsiert mit extrem kurzer Dauer (0.01ms = quasi-flackern) – bei sensiblen Nutzern störend

## Empfehlung

In `ConnectionIndicator.tsx` die Media Query direkt im inline `<style>` ergänzen:

```tsx
<style>{`
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @media (prefers-reduced-motion: reduce) {
    .connection-dot {
      animation: none !important;
    }
  }
`}</style>
```

Und dem Dot-Span eine entsprechende CSS-Klasse geben. Alternativ die Komponente auf ein CSS-Module oder Tailwind-Klassen umstellen, wo `motion-safe:animate-pulse` direkt die plattformkonforme Steuerung übernimmt.

## Priority
Fix before release
