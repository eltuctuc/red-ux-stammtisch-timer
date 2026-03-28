# BUG-FEAT2-UX-009: Timer im expired-Zustand zeigt Start-Button – aber Presets bleiben gesperrt (Widerspruch)

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** UX | Konsistenz | Flow
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Open

## Beschreibung
In `TimerControls.tsx` (Zeilen 61–71) ist der Start-Button sichtbar wenn
`status === 'idle' || status === 'expired'`:

```tsx
{(status === 'idle' || status === 'expired') && (
  <button onClick={onStart} disabled={isDisabled || !hasDuration} ...>
    Starten
  </button>
)}
```

In `ModeratorView.tsx` (Zeilen 111–119) werden Presets und CustomTimeInput
deaktiviert wenn `status === 'running'` – aber nicht wenn `status === 'expired'`:

```tsx
disabled={controlsDisabled || status === 'running'}
```

Das bedeutet: Wenn der Timer abläuft (`expired`), sind die Presets und das
Custom-Input-Feld wieder aktiv. Das ist technisch korrekt und ermöglicht Mia,
direkt eine neue Dauer zu wählen.

Der Widerspruch liegt aber darin: Im expired-Zustand ist der Start-Button sichtbar
und zeigt "Starten". Wenn Mia diesen drückt bevor sie eine neue Dauer gewählt hat,
startet der Timer mit der alten Dauer neu (weil `hasDuration` noch true ist). Das
kann gewünscht sein – aber aus Nutzerperspektive ist unklar, ob "Starten" jetzt
die alte Zeit wiederholt oder ob sie erst eine neue wählen soll.

Der Flow laut Spec ist:
> *"[bei 00:00] Visueller Zustandswechsel: expired → [Klick: Reset] → Timer zeigt wieder 10:00"*
Laut Spec ist Reset der nächste Schritt, nicht direktes Starten.

## Betroffene Datei(en)
- `projekt/src/components/TimerControls.tsx`
- `projekt/src/components/ModeratorView.tsx`

## Expected (aus Nutzerperspektive)
Nach Ablauf des Timers ist für Mia klar was die nächste Aktion ist:
Entweder "Gleiche Zeit nochmal starten" oder "Neue Zeit wählen und starten".

## Actual
Im expired-Zustand erscheinen gleichzeitig ein "Starten"-Button (für die alte Dauer)
und aktive Preset-Buttons (für eine neue Dauer). Die Intention des nächsten Schritts
ist nicht eindeutig kommuniziert.

## Fix-Hinweis
Zwei Optionen:
1. Den Start-Button im expired-Zustand umbenennen in "Nochmal starten" – damit ist
   klar, dass die gleiche Dauer wiederholt wird.
2. Im expired-Zustand zuerst nur Reset anbieten (wie im Spec-Flow beschrieben),
   und den Start-Button erst nach Reset (wenn status === 'idle') zeigen.
Option 1 ist einfacher und weniger Schritte für Mia.

## Priority
Fix before release
