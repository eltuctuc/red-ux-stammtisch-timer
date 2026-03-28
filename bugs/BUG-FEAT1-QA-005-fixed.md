# BUG-FEAT1-QA-005: CopyButton-Timeout-Memory-Leak bei schnellem Unmount

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed

## Beschreibung
`CopyButton.tsx` verwendet `setTimeout(() => setCopied(false), 2000)` ohne Cleanup. Wenn die Komponente innerhalb von 2 Sekunden nach einem Klick unmounted wird (z.B. Nutzer navigiert weg), versucht der Timeout `setCopied(false)` auf einem bereits unmounted Component aufzurufen. In React 18+ führt das nicht mehr zu einem Fehler, aber es ist ein unaufgeräumtes Timeout im Browser, das unnötig Ressourcen belegt.

## Betroffene Datei(en)
- `projekt/src/components/CopyButton.tsx` Zeile 31–32

## Steps to Reproduce / Nachweis
```typescript
// CopyButton.tsx Zeile 28-35: kein Cleanup des Timeouts
async function handleClick() {
  try {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Kein clearTimeout bei Unmount
  } catch {
    // ...
  }
}
```

Reproduktion: Kopier-Button klicken → innerhalb von 2 Sekunden zur Landing Page navigieren → Browser-Console zeigt keinen Fehler (React 18), aber Timeout läuft noch 2 Sekunden nach Unmount.

## Expected
Timeout wird bei Unmount gecleant.

## Actual
Timeout läuft weiter; `setCopied` wird auf unmounted Component aufgerufen.

## Fix-Hinweis
`useEffect` mit `useRef` für den Timeout nutzen und im Cleanup-Return `clearTimeout` aufrufen. Alternativ `useTimeout`-Pattern mit Ref.

## Priority
Nice-to-have

## Fix (2026-03-28)
useRef für setTimeout + useEffect cleanup in CopyButton.tsx implementiert.
