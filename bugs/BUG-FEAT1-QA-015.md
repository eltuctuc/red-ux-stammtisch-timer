# BUG-FEAT1-QA-015: React Hooks-Verstoß – useEffect nach bedingtem Return in ModeratorView.tsx

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung

In `ModeratorView.tsx` befindet sich ein direkter Verstoß gegen die React-Regel "Rules of Hooks": Hooks dürfen nicht nach bedingten Returns aufgerufen werden, da React die Reihenfolge der Hook-Aufrufe zwischen Renders konstant erwartet.

**Struktur des Problems:**

```
Zeile 26:   useEffect(() => { /* ROOM_EXISTS-Handler */ }, [...])   ← Hook #1
Zeile 68:   if (sessionExpired) { return (...); }                   ← BEDINGTER EARLY RETURN
Zeile 106:  useEffect(() => { /* INVALID_TOKEN-Handler */ }, [...]) ← Hook #2 NACH RETURN
```

Wenn `sessionExpired === true`, wird Hook #2 (Zeile 106) nicht aufgerufen. Beim nächsten Render, wenn `sessionExpired` wieder `false` wäre (theoretisch), würde Hook #2 wieder aufgerufen. Das verändert die Hook-Reihenfolge zwischen Renders – React verliert die Zuordnung der Hook-States.

## Auswirkung

- Im React Strict Mode (Development): `Error: React Hook "useEffect" is called conditionally.` + ESLint-Regel `react-hooks/rules-of-hooks` schlägt an
- In Production (Non-Strict): Undefiniertes Verhalten. Da `sessionExpired` ein Einweg-Flag ist (einmal true, bleibt true), wechselt die Reihenfolge nicht zurück – der Fehler ist in der Praxis latent, aber ein echter Code-Defekt
- Der INVALID_TOKEN-Handler (Zeile 106) wird nie ausgeführt wenn `sessionExpired` bereits `true` ist – das ist ein separates, kleines Funktionsproblem

## Betroffene Datei

`projekt/src/components/ModeratorView.tsx` – Zeilen 68–118

## Steps to Reproduce

1. React Strict Mode oder ESLint mit `eslint-plugin-react-hooks` aktivieren
2. `ModeratorView.tsx` öffnen
3. Expected: ESLint-Fehler "React Hook useEffect is called conditionally" auf Zeile 106
4. Actual: In Prod-Build läuft der Code ohne sichtbaren Fehler, aber die Hook-Reihenfolge ist defekt

## Fix-Hinweis

Den INVALID_TOKEN-`useEffect` (Zeile 106–118) vor den bedingten Return (Zeile 68) verschieben. Alle `useEffect`-Hooks müssen vor jedem `if (condition) return` stehen.

## Priority

Fix before release
