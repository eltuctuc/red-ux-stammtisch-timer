# BUG-FEAT2-UX-012: CustomTimeInput-Felder werden nach Preset-Auswahl nicht zurückgesetzt

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** UX / Flow
- **Gefunden von:** UX Reviewer
- **Status:** Fixed
- **Fixed on:** 2026-03-29

## Problem

Wenn der Moderator zuerst eine individuelle Zeit in das CustomTimeInput eingibt (z.B. "07" Min / "30" Sek), dann aber stattdessen auf einen Preset-Button klickt, bleiben die Werte "07" und "30" im CustomTimeInput sichtbar. Der angezeigte Timer läuft mit der Preset-Dauer, aber das Eingabefeld zeigt noch die alte manuelle Eingabe. Das ist widersprüchlich: Die Felder suggerieren, dass die angezeigte Zeit aus der manuellen Eingabe stammt, obwohl tatsächlich der Preset aktiv ist.

## Steps to Reproduce

1. Moderatoren-Ansicht öffnen
2. "07" in das Min-Feld, "30" in das Sek-Feld eingeben (nicht absenden)
3. Auf den "10 Min"-Preset-Button klicken
4. Expected: CustomTimeInput-Felder zeigen leere Placeholder (0 / 00) oder werden geleert
5. Actual: Felder zeigen weiterhin "07" / "30", obwohl der aktive Timer auf 10:00 gesetzt ist

## Empfehlung

`CustomTimeInput` erhält eine zusätzliche Prop `resetTrigger` (z.B. einen Counter-Wert oder einen Key), der von `ModeratorView` hochgezählt wird, wenn ein Preset ausgewählt wird. Alternativ kann `CustomTimeInput` controlled werden und `ModeratorView` setzt minutes/seconds extern auf '' zurück, wenn `handleSetDuration` über einen Preset-Klick ausgelöst wird.

## Priority
Fix before release

**Fix:** CustomTimeInput bekommt resetTrigger-Prop; ModeratorView inkrementiert presetResetKey bei Preset-Klick.
