# BUG-FEAT1-UX-013: Input-Fokus-Ring nur per JavaScript – kein CSS-basierter focus-visible

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** A11y | UX
- **Gefunden von:** UX Reviewer
- **Persona:** Beide (Mia und Lea)
- **Status:** Fixed – 2026-03-28 – index.css: input:focus-visible hinzugefügt; LandingPage.tsx: onFocus/onBlur-Handler und outline:none entfernt

## Beschreibung

Der globale Fix aus BUG-FEAT1-UX-002 hat `button:focus-visible` korrekt in `index.css` ergänzt. Für das Smart-Input-Feld in `LandingPage.tsx` wurde der Fokus-Ring jedoch ausschließlich per JavaScript-Handler umgesetzt:

```tsx
style={{ outline: 'none' }}   // entfernt nativen Fokus-Ring dauerhaft
onFocus={(e) => { e.currentTarget.style.borderColor = ... }}
onBlur={(e)  => { e.currentTarget.style.borderColor = ... }}
```

Das ist kein funktionaler Fokus-Indikator im Sinne von WCAG 2.1 SC 2.4.7 (Focus Visible). Probleme:

1. **Kein focus-visible-Unterschied:** Die Grenzfarbe wechselt bei jedem `focus`-Event – also auch bei Maus-Klick. Ein sichtbarer Fokus-Ring sollte nach WCAG-Empfehlung nur bei Keyboard-Navigation erscheinen (`:focus-visible`). Der aktuelle Ansatz zeigt den Border-Wechsel auch bei Mausklick, was visuell inkonsistent mit dem Button-Verhalten ist (Buttons nutzen `:focus-visible` und zeigen keinen Ring bei Mausklick).

2. **Kein CSS-Äquivalent für `input:focus-visible`:** In `index.css` ist nur `button:focus-visible` definiert. Das Input-Element hat kein CSS-Fokus-Styling. Wenn JavaScript deaktiviert ist, gibt es keinen Fokus-Indikator.

3. **Fehlende Outline-Stärke:** Der Fokus-Indikator ist nur ein Border-Farbwechsel (kein `outline`). WCAG 2.2 SC 2.4.11 (Focus Appearance) verlangt einen Fokus-Indikator mit mindestens 2px Breite und ausreichendem Kontrast. Ein Border-Farbwechsel allein erfüllt das nicht zuverlässig.

## Steps to Reproduce

1. Öffne die LandingPage (/)
2. Navigiere mit der Tab-Taste zum Smart-Input-Feld
3. Expected: Klarer Fokus-Ring (outline, 2px, accent-Farbe) um das Input – konsistent mit den Buttons
4. Actual: Nur Border-Farbwechsel von gray zu blue – kein outline, kein konsistenter WCAG-konformer Fokus-Indikator. Bei Mausklick erscheint der gleiche Border-Wechsel wie bei Keyboard-Navigation.

## Empfehlung

In `index.css` ergänzen:

```css
input:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

Den `onFocus`/`onBlur`-Handler im Input auf Border-Feedback bei Fehlerzustand beschränken (nur wenn `inputError` gesetzt). Den Fehler-Border-Farbwechsel beibehalten, aber nicht als Ersatz für den Fokus-Ring.

## Priority

Fix before release
