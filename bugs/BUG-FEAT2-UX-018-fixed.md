# BUG-FEAT2-UX-018: Moderatoren-URL in ShareSection ohne Warnung vor versehentlichem Teilen

- **Feature:** FEAT-2 – Timer
- **Severity:** High
- **Bereich:** UX / Flow
- **Gefunden von:** UX Reviewer
- **Status:** Fixed
- **Fixed on:** 2026-03-29

## Problem

Der Moderatoren-Link wird in der ShareSection mit dem Label "Mein Moderatoren-Link (privat halten)" angezeigt und kann per CopyButton in die Zwischenablage kopiert werden. Das Problem: Der CopyButton zeigt nur "Moderatoren-Link kopieren" – ohne jeden Hinweis, was passiert wenn dieser Link geteilt wird. Ein Moderator, der im Stress des Workshops schnell beide URLs verschickt, teilt versehentlich die Kontrolle über den Timer.

Es gibt keinen Schutzmechanismus, keine Bestätigung und keine visuelle Warnung (z.B. rote Farbe, Gefahren-Icon), die kommuniziert: "Vorsicht – wer diesen Link hat, kann deinen Timer steuern."

Das Label "privat halten" ist zu dezent (13px, `--color-text-secondary`) und geht im Layout unter.

## Steps to Reproduce

1. Als Moderator ShareSection öffnen
2. "Moderatoren-Link kopieren" klicken – in 2 Sekunden ist der Link in der Zwischenablage
3. Expected: Mindestens ein visuell distinktiver Warnhinweis, der die Konsequenz des Teilens klar macht
4. Actual: Kein Unterschied im visuellen Gewicht zwischen Teilnehmer-Link und Moderatoren-Link; der Moderatoren-CopyButton sieht identisch aus

## Empfehlung

Zwei Maßnahmen kombinieren:
1. Den Moderatoren-Link-Bereich visuell abheben: z.B. leicht gelblicher Hintergrund (`--timer-bg-warning`), oder ein Warn-Icon (SVG) neben dem Label.
2. Den Warntext "privat halten" prominenter machen: `--color-danger` oder mindestens `--color-text-primary`, fontWeight 500+.

Optional (Nice-to-have): Ein Confirmation-Dialog vor dem Kopieren ("Dieser Link gibt volle Kontrolle über den Timer. Wirklich kopieren?").

## Priority
Fix before release

**Fix:** ShareSection.tsx – Moderatoren-URL-Bereich mit Warning-Hintergrund und Warntext versehen.
