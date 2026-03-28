# BUG-FEAT2-UX-005: Deaktivierte Preset-Buttons ohne Erklärung warum sie gesperrt sind

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** UX | Feedback
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Fixed — 2026-03-28

## Beschreibung
In `ModeratorView.tsx` (Zeilen 111–119) werden `PresetButtons` und `CustomTimeInput`
beim `status === 'running'` mit `disabled={true}` übergeben:

```tsx
<PresetButtons
  disabled={controlsDisabled || status === 'running'}
/>
<CustomTimeInput
  disabled={controlsDisabled || status === 'running'}
/>
```

Wenn der Timer läuft, sind alle 5 Preset-Buttons und die Custom-Input-Felder deaktiviert.
Es gibt keinen erklärenden Text oder Tooltip warum. Für Mia, die spontan eine andere
Timebox-Dauer wählen will (z. B. weil die Gruppe schneller fertig ist), ist nicht
sofort klar, dass sie erst den Timer pausieren oder zurücksetzen muss.

In der Spec steht dazu nichts Explizites – die Entscheidung, Presets beim laufenden
Timer zu sperren, ist sinnvoll (verhindert verwirrende State-Konflikte), aber der
Nutzer bekommt keine Orientierung.

## Betroffene Datei(en)
- `projekt/src/components/ModeratorView.tsx`
- `projekt/src/components/PresetButtons.tsx`
- `projekt/src/components/CustomTimeInput.tsx`

## Expected (aus Nutzerperspektive)
Mia versteht, dass sie den Timer zuerst pausieren/zurücksetzen muss, bevor sie eine
neue Dauer wählen kann. Diese Information ist klar kommuniziert.

## Actual
Die Preset-Buttons erscheinen ausgegraut, ohne Erklärung. Mia muss selbst herausfinden,
dass Pause/Reset den Weg freimacht.

## Fix-Hinweis
Einen kurzen Hinweistext neben oder unterhalb der Preset-Buttons einblenden,
wenn `status === 'running'`: z. B. "Timer pausieren um Dauer zu ändern".
Alternativ: Tooltip auf den Preset-Buttons wenn disabled (`title`-Attribut als
einfachste Lösung, auch wenn es keine perfekte A11y-Lösung ist).

## Priority
Nice-to-have
