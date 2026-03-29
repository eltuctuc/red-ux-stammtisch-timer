# BUG-FEAT2-UX-021: Warning-Box Moderatoren-URL nicht als Warnung für Screenreader markiert

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Die Warning-Box für den Moderatoren-Link (Fix für UX-018) transportiert visuell eine klare Warnung ("Nur für dich – wer diesen Link hat, kann den Timer steuern."), aber sie ist semantisch für Screenreader nicht als Warnung ausgezeichnet.

Der Container hat weder `role="alert"` noch `role="region"` mit `aria-label`. Wenn ein Screenreader-Nutzer die ShareSection aufklappt, wird der Fokus auf den ersten CopyButton ("Teilnehmer-Link kopieren") gesetzt – die Warning-Box für den Moderatoren-Link liegt danach im DOM. Ein Screenreader liest den Warnungstext nur linear vor, ohne ihn von anderen Textblöcken zu unterscheiden.

WCAG 1.3.3 (Sensory Characteristics) und 4.1.3 (Status Messages): Warnungen müssen nicht zwingend `role="alert"` haben, aber der semantische Kontext muss erkennbar sein. Hier fehlt jede semantische Kennzeichnung des Warnungscharakters.

```tsx
// ShareSection.tsx Z.127-155 – die Warning-Box hat kein semantisches Markup:
<div
  style={{
    background: 'var(--timer-bg-warning)',
    border: '1px solid #E8C54A',
    ...
  }}
>
  <p style={{ ... }}>Mein Moderatoren-Link</p>
  <p style={{ ... }}>Nur für dich – wer diesen Link hat, kann den Timer steuern.</p>
  ...
</div>
```

## Steps to Reproduce

1. ShareSection mit Screenreader (VoiceOver/NVDA) aufklappen
2. Tab durch den Inhalt navigieren
3. Expected: Screenreader kündigt den Bereich als Warnung oder wichtige Information an; der Sicherheitshinweis wird vor dem CopyButton vorgelesen
4. Actual: Der Warnungstext ist semantisch nicht von normalem Text unterscheidbar; kein Hinweis auf den kritischen Charakter des Moderatoren-Links

## Empfehlung

Den Warning-Container mit `role="region"` und `aria-label="Moderatoren-Link – nur für dich"` auszeichnen. Alternativ den Warnungstext mit `aria-describedby` am CopyButton referenzieren, sodass der Screenreader beim Fokussieren des Buttons den Kontext mitliest:

```tsx
<div
  role="region"
  aria-label="Moderatoren-Link – nur für dich"
  style={{ ... }}
>
  ...
  <CopyButton
    value={moderatorUrl}
    label="Moderatoren-Link kopieren"
    aria-describedby="mod-url-warning"
  />
</div>
```

## Priority
Fix before release
