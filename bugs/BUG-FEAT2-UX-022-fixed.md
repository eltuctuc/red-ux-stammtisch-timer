# BUG-FEAT2-UX-022: ShareSection Auto-Open (initiallyOpen=true) setzt keinen initialen Fokus

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y / Focus Management
- **Gefunden von:** UX Reviewer
- **Status:** Fixed – 2026-03-29
- **Fix:** Separater `useEffect` ohne Dependencies in `ShareSection.tsx` ergänzt, der einmalig beim Mount feuert und Fokus auf den ersten CopyButton setzt, wenn `initiallyOpen=true`. Der bestehende `isFirstRender`-Guard bleibt für User-triggered Opens unverändert.

## Problem

Der Fix für UX-006/UX-010 implementiert Fokus-Management über einen `useEffect`, der bei Zustandsänderungen von `isOpen` reagiert. Ein `isFirstRender`-Guard verhindert, dass der Effect beim initialen Mount feuert:

```tsx
// ShareSection.tsx Z.18-30
const isFirstRender = useRef(true);
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;  // <-- Guard blockt den ersten Effect-Aufruf
  }
  if (isOpen) {
    const btn = firstCopyWrapperRef.current?.querySelector<HTMLButtonElement>('button');
    btn?.focus();
  } else {
    toggleButtonRef.current?.focus();
  }
}, [isOpen]);
```

Wenn die ShareSection mit `initiallyOpen={true}` gerendert wird (neue Session), ist `isOpen` von Anfang an `true`. Der useEffect feuert beim ersten Render, trifft aber auf den Guard und kehrt zurück – der Fokus auf den ersten CopyButton wird **nie gesetzt**.

Das betrifft Moderatoren, die gerade eine neue Session erstellt haben: Die ShareSection klappt automatisch auf (korrekt laut Spec), aber der Tastaturfokus bleibt an der letzten interaktiven Stelle (vorheriger Screen). Der Nutzer muss manuell tabben, um in den aufgeklappten Inhalt zu gelangen.

## Steps to Reproduce

1. Neue Session erstellen (Redirect auf Moderatoren-Ansicht mit `isNew=true`)
2. ShareSection ist automatisch aufgeklappt (initiallyOpen=true)
3. Mit Tastaturnavigation versuchen, in den ShareSection-Inhalt zu gelangen
4. Expected: Fokus liegt auf dem ersten CopyButton ("Teilnehmer-Link kopieren") nach dem automatischen Aufklappen
5. Actual: Fokus liegt an der letzten Stelle aus dem vorherigen Interaktionsfluss – kein automatischer Fokus-Sprung in den aufgeklappten Bereich

## Empfehlung

Den isFirstRender-Guard so anpassen, dass er den Fokus-Sprung bei initialem `isOpen=true` nicht blockiert. Eine saubere Lösung: den Guard nur für `isOpen=false` überspringen, oder einen separaten `useEffect` für den initialen Open-Zustand verwenden:

```tsx
// Separater Effect nur für initiales Open
useEffect(() => {
  if (initiallyOpen) {
    const btn = firstCopyWrapperRef.current?.querySelector<HTMLButtonElement>('button');
    btn?.focus();
  }
  // Intentionally no deps on initiallyOpen - only runs once on mount
}, []);
```

## Priority
Fix before release
