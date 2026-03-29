# BUG-FEAT2-UX-013: Expired-Zustand bleibt für Teilnehmer ohne Handlungshinweis

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** UX / Flow
- **Gefunden von:** UX Reviewer
- **Status:** Fixed
- **Fixed on:** 2026-03-29

## Problem

Wenn der Timer auf 00:00 läuft und den Zustand "expired" erreicht, sieht die Teilnehmer-Ansicht nur den roten Timer mit "00:00". Es gibt keinen Hinweistext, der erklärt, was als nächstes passiert. Der Zustand fühlt sich wie eine Sackgasse an – der Teilnehmer weiß nicht, ob er warten soll, ob der Moderator den Timer zurücksetzen wird oder ob das Meeting-Segment beendet ist.

Die Idle-State-Behandlung (Fix UX-004) zeigt bereits "Warten auf nächsten Timer…" im Idle-Zustand. Für den Expired-Zustand fehlt eine analoge Rückmeldung.

## Steps to Reproduce

1. Als Teilnehmer der Session beitreten, während Timer läuft
2. Timer bis auf 00:00 laufen lassen
3. Expected: Kurzer Statustext z.B. "Zeit abgelaufen – der Moderator startet den nächsten Timer" oder ähnlich
4. Actual: Nur roter Timer mit 00:00, kein kontextueller Hinweis, kein nächster Schritt erkennbar

## Empfehlung

In `ParticipantView.tsx` analog zum Idle-Hinweis einen Expired-Hinweistext ergänzen:
```
{status === 'expired' && (
  <p ...>Zeit abgelaufen.</p>
)}
```
Der Text muss nicht `aria-live` sein – der Zustandswechsel wird bereits durch die bestehende assertive-Region in `TimerDisplay` angekündigt.

## Priority
Fix before release

**Fix:** ParticipantView.tsx – 'Zeit abgelaufen.' Text im expired-State für Teilnehmer ergänzt.
