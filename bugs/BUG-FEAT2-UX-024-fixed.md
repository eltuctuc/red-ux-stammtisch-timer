# BUG-FEAT2-UX-024: CopyButton Moderatoren-Link hat kein aria-describedby zum Warnungstext

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Fixed – 2026-03-29

## Problem

Der Fix für UX-021 zeichnet die Warning-Box in `ShareSection.tsx` mit `role="region"` und `aria-label="Moderatoren-Link – nur für dich"` aus. Das ist eine Verbesserung, aber die UX-021-Empfehlung enthielt explizit auch diesen zweiten Schritt:

> `<CopyButton value={moderatorUrl} label="Moderatoren-Link kopieren" aria-describedby="mod-url-warning" />`

Dieser Schritt wurde nicht umgesetzt. Im aktuellen Zustand kündigt der Screenreader beim Navigieren durch die Region zwar "Moderatoren-Link – nur für dich" an (wegen `aria-label`), aber wenn der Screenreader-Nutzer den Tab-Fokus direkt auf den CopyButton "Moderatoren-Link kopieren" setzt, hört er:

- "Moderatoren-Link kopieren, Schaltfläche"

Er hört NICHT den Warnungstext "Nur für dich – wer diesen Link hat, kann den Timer steuern." beim Fokussieren des Buttons selbst. Der semantische Kontext des Sicherheitshinweises ist beim Button-Fokus nicht verknüpft.

WCAG 1.3.1 (Info and Relationships): Semantische Informationen, die visuell einen Zusammenhang darstellen (Button gehört zu Warnungsbereich), müssen auch programmatisch abrufbar sein.

Technische Ursache: `CopyButton.tsx` akzeptiert keine `aria-describedby`-Prop. Der Warnungstext-Paragraph (`<p>Nur für dich…</p>`) hat keine `id`. Die Verknüpfung fehlt auf beiden Seiten.

## Steps to Reproduce

1. ShareSection öffnen (als Moderator)
2. Mit Tab zum CopyButton "Moderatoren-Link kopieren" navigieren (ohne vorher durch den gesamten Region-Text zu lesen)
3. Expected: Screenreader liest beim Button-Fokus den Warnungstext mit, z.B. "Moderatoren-Link kopieren, Schaltfläche – Nur für dich – wer diesen Link hat, kann den Timer steuern."
4. Actual: Screenreader liest nur "Moderatoren-Link kopieren, Schaltfläche" – Warnungskontext fehlt beim direkten Tab-Zugriff

## Empfehlung

Zwei Änderungen nötig:

1. Den Warnungstext-Paragraph in `ShareSection.tsx` mit einer `id` versehen:
```tsx
<p id="mod-url-warning" style={{ fontSize: '13px', color: '#7A4900' }}>
  Nur für dich – wer diesen Link hat, kann den Timer steuern.
</p>
```

2. `CopyButton.tsx` um eine optionale `describedBy`-Prop erweitern und am Button-Element als `aria-describedby` setzen. Alternativ: Den Warnungstext direkt in ein visually-hidden `aria-describedby`-Ziel am Button wrappen.

## Priority
Fix before release
