# BUG-FEAT1-UX-026: CopyButton Erfolgs-Feedback ("Kopiert!") ohne aria-live – Screen Reader erfährt nichts von der Bestätigung

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

CopyButton.tsx verwendet `aria-label` um den Zustand zu kommunizieren (Zeilen 64–68):

```tsx
const ariaLabel = copied
  ? 'In Zwischenablage kopiert'
  : copyError
  ? 'Kopieren fehlgeschlagen'
  : label;
```

Das ist ein korrekter Ansatz. Das Problem: `aria-label`-Änderungen auf einem Button werden von Screen Readern nicht automatisch als Live-Ankündigung ausgerufen. Screen Reader lesen `aria-label` nur vor, wenn der Button fokussiert wird oder wenn der User den Fokus bewegt. Da der Button nach dem Klick den Fokus behält, gibt es keine Garantie, dass die Änderung des `aria-label` vorgelesen wird.

Das Ergebnis: Sehende User sehen den grünen "Kopiert!"-Text plus Icon-Wechsel (Checkmark). Blinde User hören nach dem Klick möglicherweise nichts – die Bestätigung fehlt vollständig.

Der Fehlerfall ist durch `<p role="alert">` abgedeckt (UX-017-Fix). Der Erfolgsfall ist es nicht.

## Steps to Reproduce

1. Öffne ShareSection mit einem Screen Reader (VoiceOver/NVDA)
2. Fokussiere "Teilnehmer-Link kopieren"-Button
3. Aktiviere den Button (Enter/Space)
4. Expected: Screen Reader kündigt sofort an "In Zwischenablage kopiert" oder "Kopiert!"
5. Actual: Keine automatische Ankündigung; Screen Reader liest ggf. den neuen aria-label erst vor wenn der User den Fokus erneut auf den Button bewegt

## Empfehlung

Eine versteckte `aria-live="polite"`-Region hinzufügen, die den Kopier-Status ankündigt:

```tsx
<span
  aria-live="polite"
  aria-atomic="true"
  style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
>
  {copied ? 'In Zwischenablage kopiert' : ''}
</span>
```

Alternativ: Den Button selbst mit `aria-live="polite"` versehen – das ist weniger standardkonform, funktioniert aber in den meisten SR-Implementierungen.

## Priority

Fix before release
