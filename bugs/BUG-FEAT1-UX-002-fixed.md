# BUG-FEAT1-UX-002: "Weiter"-Button und "Neue Session"-Button ohne sichtbaren Fokus-/Hover-State

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Persona:** Beide
- **Status:** Fixed

## Beschreibung
Die globale CSS-Datei (`index.css`) setzt `border: none` und `background: none` auf allen `button`-Elementen,
überschreibt aber den Browser-Standard-Fokusring (`outline`) nicht explizit mit einem sichtbaren Ersatz.
Der "Weiter"-Button in der `LandingPage` und der "Neue Session starten"-Button haben keinen `onFocus`/`onBlur`-Handler
(anders als das Input-Feld). Der "Weiter"-Button hat auch keinen `hover`-Zustand (keine Hintergrundfarbe-Änderung).

Konkret in `LandingPage.tsx`:
- Der "Neue Session starten"-Button wechselt via `transition` die Hintergrundfarbe – aber nur über den `isStarting`-State,
  nicht bei hover/focus.
- Der "Weiter"-Button (Submit) hat überhaupt keinen visuellen Feedback-Zustand bei hover oder Tastatur-Fokus.

In `index.css` ist `outline: none` im Input explizit gesetzt (`LandingPage.tsx` Zeile 167), kein globales
`focus-visible`-Reset, aber auch kein expliziter Ersatz für Buttons.

## Betroffene Datei(en)
- `projekt/src/components/LandingPage.tsx`
- `projekt/src/index.css`

## Expected (aus Nutzerperspektive)
Beim Navigieren per Tab sollte ein klar sichtbarer Fokusring um Buttons erscheinen (WCAG 2.1 SC 2.4.7).
Beim Hover über Buttons sollte eine visuelle Rückmeldung erfolgen (Hintergrundfarbe, Helligkeit).

## Actual
Keyboard-Nutzer sehen beim Tabben auf den "Weiter"-Button möglicherweise keinen oder nur den schwachen
Browser-Standard-Fokusring (der oft durch das Inline-CSS überschrieben wird). Hover zeigt keine Reaktion.

## Fix-Hinweis
In `index.css` einen globalen `button:focus-visible`-Stil mit sichtbarem Outline definieren
(z. B. `outline: 2px solid var(--color-accent); outline-offset: 2px`).
Für den "Weiter"-Button einen hover-State per `onMouseEnter`/`onMouseLeave` oder via CSS-Klasse ergänzen.

## Priority
Fix before release

## Fix (2026-03-28)
button:focus-visible in index.css ergänzt (2px solid accent, offset 2px). Hover-States für 'Neue Session' (accent-hover) und 'Weiter'-Button (border-color) via onMouseEnter/Leave.
