# BUG-FEAT2-UX-016: ShareSection hat doppelte hidden-Logik – `hidden`-Attribut und `display:none` gleichzeitig

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

In `ShareSection.tsx` wird der Inhalt-Container mit zwei redundanten Versteck-Mechanismen gesteuert:

```tsx
hidden={!isOpen}
style={{
  display: isOpen ? 'flex' : 'none',
  ...
}}
```

Das `hidden`-HTML-Attribut setzt von sich aus `display: none` (User-Agent-Stylesheet). Das zusätzliche `display: none` im Style ist redundant. Kritisch ist dabei: Das `hidden`-Attribut entfernt das Element korrekt aus dem Accessibility-Tree. Das zusätzliche inline `display: 'none'` macht dasselbe, aber wenn der Code weiterentwickelt wird und jemand nur das `hidden`-Attribut entfernt, bleibt das Element unsichtbar durch das inline-style – ein stiller, schwer debuggbarer Fehler.

Außerdem wird der Container mit `id="share-section-content"` versehen, obwohl `aria-controls` auf dem Toggle-Button bewusst entfernt wurde (Fix UX-006). Die `id` ist damit wirkungslos.

## Steps to Reproduce

1. ShareSection im DOM inspizieren (DevTools)
2. Expected: Entweder `hidden`-Attribut ODER `display: none` in style – nicht beides
3. Actual: Beide Mechanismen gleichzeitig aktiv; `id="share-section-content"` ohne Referenz verwaist

## Empfehlung

Entweder:
- `hidden={!isOpen}` beibehalten und `display: isOpen ? 'flex' : 'none'` aus dem Style entfernen (durch `display: 'flex'` ersetzen und `hidden` als alleinigen Kontrollmechanismus nutzen)
- Oder umgekehrt: `hidden` entfernen und nur `display` steuern

Die verwaiste `id="share-section-content"` entweder entfernen oder als `aria-controls`-Ziel reaktivieren.

## Priority
Nice-to-have
