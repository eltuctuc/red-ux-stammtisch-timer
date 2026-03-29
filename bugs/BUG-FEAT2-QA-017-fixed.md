# BUG-FEAT2-QA-017: ShareSection Auto-Open triggert doppelten Focus-Call auf Screen Readern

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** A11y
- **Gefunden von:** QA Engineer
- **Status:** Fixed – 2026-03-29

## Steps to Reproduce

1. Neue Session erstellen (Redirect auf `?mod=<token>&new=1`)
2. Verbindung aufbauen lassen, ersten STATE_UPDATE abwarten
3. ShareSection öffnet sich automatisch (QA-016-Fix greift)
4. Screen Reader aktiv haben (VoiceOver, NVDA)

5. Expected: Screen Reader kündigt den Fokus-Wechsel zum ersten CopyButton einmal an
6. Actual: Screen Reader kündigt den Fokus-Wechsel zweimal hintereinander an (doppeltes "Teilnehmer-Link kopieren, Schaltfläche")

## Root Cause

Der QA-016-Fix führte zwei useEffects in `ShareSection.tsx` ein, die beide `btn?.focus()` aufrufen können:

**Effect 1 (`[isOpen]`, Zeile 19–30):** Reagiert auf isOpen-State-Änderungen. Ruft `btn?.focus()` auf wenn `isOpen === true`. Hat isFirstRender-Guard der nur den ersten Mount überspringt.

**Effect 2 (`[initiallyOpen]`, Zeile 36–45):** Reagiert auf initiallyOpen-Prop-Änderungen. Ruft bei `initiallyOpen === true` zunächst `setIsOpen(true)` auf und anschließend direkt `btn?.focus()` (Zeile 41).

Wenn `initiallyOpen` von `false` auf `true` wechselt (der normale async-Fall nach dem ersten STATE_UPDATE), laufen beide Effects:

1. Effect 2 feuert (wegen `initiallyOpen`-Änderung):
   - `setIsOpen(true)` – schedult einen neuen React-Render
   - `btn?.focus()` – **erster Focus-Call**

2. Nach dem nächsten Render durch `setIsOpen(true)` feuert Effect 1 (wegen `isOpen`-Änderung):
   - `isOpen === true` → `btn?.focus()` – **zweiter Focus-Call**

Zwei `focus()`-Aufrufe auf dasselbe Element in kurzer Folge: Für Screen Reader ist jeder `focus()`-Aufruf ein Fokus-Ereignis das vorgelesen wird. Das führt zur doppelten Ankündigung.

## Betroffene Datei

`/projekt/src/components/ShareSection.tsx`, Zeilen 19–45

## Empfehlung

Den direkten `btn?.focus()`-Call aus dem `[initiallyOpen]`-Effect (Zeile 41) entfernen. Der Kommentar "When isOpen was already true at mount the [isOpen] effect won't re-fire, so trigger focus directly here for that edge case" beschreibt einen Edge Case (initiallyOpen=true bereits beim Mount), der in der Praxis nie eintritt: ModeratorView berechnet `isNewSession` erst nach dem ersten STATE_UPDATE via Ref-Logik, also ist `initiallyOpen` beim Mount immer `false`. Der Edge-Case-Kommentar begründet unnötigen Code der den Hauptpfad kaputt macht.

Der `[initiallyOpen]`-Effect sollte nur `setIsOpen(true)` aufrufen; der `[isOpen]`-Effect übernimmt dann den Focus zuverlässig.

## Priority

Nice-to-have (nur Screen Reader betroffen, kein funktionaler Defekt)
