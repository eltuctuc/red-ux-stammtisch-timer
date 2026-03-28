# BUG-FEAT2-UX-003: CustomTimeInput – beide Felder als aria-invalid markiert obwohl Fehler nur eines betrifft

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y | UX
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Open

## Beschreibung
In `CustomTimeInput.tsx` teilen sich beide Eingabefelder (Minuten und Sekunden) dasselbe
`aria-describedby`-Attribut mit derselben `errorId`, und beide erhalten bei einem Fehler
`aria-invalid="true"`:

```tsx
// Minuten-Feld
aria-describedby={error ? errorId : undefined}
aria-invalid={error ? 'true' : undefined}

// Sekunden-Feld – identisch
aria-describedby={error ? errorId : undefined}
aria-invalid={error ? 'true' : undefined}
```

Wenn Mia nur im Sekunden-Feld einen ungültigen Wert eingibt (z. B. "99"), wird
auch das Minuten-Feld als `aria-invalid` markiert – obwohl dort ein korrekter Wert steht.
Umgekehrt: Bei "Mindestdauer: 1 Sekunde" (beide Felder leer) wäre `aria-invalid` auf
beiden korrekt. Aber bei "Sekunden müssen zwischen 0 und 59 liegen" betrifft der
Fehler ausschließlich das Sekunden-Feld.

Zusätzlich: Beide Felder teilen den gleichen roten Border bei Fehler (Zeile 85 und 133),
unabhängig davon welches Feld den Fehler verursacht hat.

## Betroffene Datei(en)
- `projekt/src/components/CustomTimeInput.tsx`

## Expected (aus Nutzerperspektive)
Mia sieht und hört (per Screenreader), welches konkrete Feld den Fehler enthält.
Das nicht-fehlerhafte Feld bleibt neutral.

## Actual
Bei jedem Validierungsfehler werden beide Felder rot markiert und beide als `aria-invalid`
angekündigt, unabhängig davon welches Feld den Fehler verursacht hat.

## Fix-Hinweis
Den Fehler-State differenzieren: Ein `errorField: 'minutes' | 'seconds' | 'both' | null`-State
einführen und `aria-invalid` sowie Border-Farbe nur auf dem tatsächlich betroffenen Feld
setzen. Die Validierungslogik kennt bereits den Kontext (Sekunden > 59 betrifft nur secs).

## Priority
Fix before release
