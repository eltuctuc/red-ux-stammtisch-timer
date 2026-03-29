# BUG-FEAT2-QA-016: ShareSection Auto-Open funktioniert nicht – isOpen reagiert nicht auf nachträgliche initiallyOpen-Änderung

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed – 2026-03-29

## Steps to Reproduce

1. Neue Session erstellen (Redirect auf Moderatoren-Ansicht mit `?mod=<token>&new=1`)
2. Verbindung wird aufgebaut, STATE_UPDATE kommt asynchron
3. ShareSection beobachten

4. Expected: ShareSection ist nach dem ersten STATE_UPDATE automatisch aufgeklappt (laut Spec: "beim ersten Öffnen der Session (direkt nach Erstellung) einmalig aufgeklappt")
5. Actual: ShareSection bleibt collapsed – der Auto-Open funktioniert nicht

## Root Cause

Das Problem liegt in der Kombination aus zwei Stellen:

**1. ModeratorView.tsx, Zeile 107–116:**
```tsx
if (shareInitiallyOpenRef.current === null && timerState !== null) {
  // ... Logik die shareInitiallyOpenRef.current auf true setzt
}
const isNewSession = shareInitiallyOpenRef.current ?? false;
```

Beim ersten Render ist `timerState === null`, also bleibt `shareInitiallyOpenRef.current === null` und `isNewSession = false`. Die ShareSection wird mit `initiallyOpen={false}` gemountet. Erst beim zweiten Render (nach dem ersten STATE_UPDATE) wird `shareInitiallyOpenRef.current = true` und `isNewSession = true`.

**2. ShareSection.tsx, Zeile 11:**
```tsx
const [isOpen, setIsOpen] = useState(initiallyOpen);
```

`useState(initiallyOpen)` verwendet `initiallyOpen` nur als **Initializer** – der Wert wird einmalig beim Mount ausgewertet. Wenn `initiallyOpen` sich bei einem späteren Re-Render von `false` auf `true` ändert, aktualisiert React den State **nicht**. `isOpen` bleibt `false`.

**Konsequenz:** Die ShareSection öffnet sich nie automatisch, da `initiallyOpen` beim Mount immer `false` ist. Die Implementierung von BUG-FEAT2-QA-008 (sessionStorage-Logik) ist korrekt, aber ihr Ergebnis kommt immer zu spät – nach dem Mount.

**Zusätzliche Auswirkung auf BUG-FEAT2-UX-022:** Der Fix für UX-022 (mount-time useEffect für initialen Fokus) setzt auf einer Auto-Open-Funktion auf, die nicht funktioniert. Da `isOpen` beim Mount immer `false` ist, wird der mount-useEffect zwar ausgeführt, trifft aber korrekt auf `initiallyOpen=false` und setzt keinen Fokus. Der UX-022-Fix ist damit wirkungslos.

## Betroffene Dateien

- `projekt/src/components/ModeratorView.tsx`, Zeile 107–116: `shareInitiallyOpenRef`-Logik berechnet `isNewSession` erst beim zweiten Render
- `projekt/src/components/ShareSection.tsx`, Zeile 11: `useState(initiallyOpen)` reagiert nicht auf Prop-Änderungen nach dem Mount

## Priority

Fix before release

## Fix

`ShareSection.tsx`: Ersetze den mount-only UX-022 Effect durch einen `useEffect([initiallyOpen])`-Effect der auf Prop-Änderungen reagiert. Wenn `initiallyOpen` zu `true` wird (auch asynchron nach erstem STATE_UPDATE), wird `setIsOpen(true)` aufgerufen. Der bestehende `[isOpen]`-Effect setzt danach korrekt den Fokus auf den ersten Button.
