# BUG-FEAT1-UX-007: aria-controls referenziert nicht-existentes Element wenn ShareSection geschlossen

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

In `ShareSection.tsx` (Zeile 29) hat der Toggle-Button das Attribut `aria-controls="share-section-content"`. Dieses Attribut soll auf das kontrollierte Element zeigen – laut ARIA-Spezifikation muss das referenzierte Element im DOM existieren.

Das `div` mit `id="share-section-content"` wird aber nur gerendert wenn `isOpen === true` (Zeile 52: `{isOpen && <div id="share-section-content">...`). Wenn die ShareSection geschlossen ist, existiert das Element nicht im DOM.

Das Ergebnis: Screen Reader können die Verbindung zwischen Button und Inhalt nicht herstellen, solange die Section geschlossen ist. Beim Tabben auf den Button ohne Screen Reader ist kein Problem sichtbar – für Assistive Technology ist die Kontrollelation aber defekt.

ARIA-Regel (WCAG 2.1, ARIA 1.2): `aria-controls` muss auf ein Element verweisen, das im DOM existiert. Entweder muss das Element per `hidden`-Attribut/`display:none` versteckt werden (statt gar nicht gerendert), oder `aria-controls` muss weggelassen werden.

## Steps to Reproduce
1. Öffne Moderatoren-Ansicht einer Session
2. Nutze Screen Reader (VoiceOver / NVDA) und navigiere per Tab zum "Session teilen"-Button
3. Screen Reader kündigt `aria-controls` auf ein Element an, das nicht im DOM ist
4. Expected: Screen Reader kann nach Aktivierung den Fokus korrekt auf den kontrollierten Bereich setzen
4. Actual: Referenz ist defekt, weil das Element noch nicht im DOM existiert

## Empfehlung
Das `div#share-section-content` immer im DOM belassen und stattdessen per `hidden`-Attribut oder `style={{ display: 'none' }}` verstecken, wenn `isOpen === false`. Alternativ: `aria-controls` entfernen und stattdessen nur `aria-expanded` behalten – das reicht für den Use Case aus.

## Priority
Fix before release
