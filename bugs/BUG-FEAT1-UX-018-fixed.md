# BUG-FEAT1-UX-018: ConnectionIndicator error-State ohne klickbare Reload-Aktion

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Feedback | A11y
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator) | Lea (Teilnehmer) | Beide
- **Status:** Fixed — 2026-03-28
- **Fix:** `ConnectionIndicator.tsx` now uses `role="alert"` + `aria-live="assertive"` in error state (vs. `role="status"` / `aria-live="polite"` for connecting/disconnected). Error state displays "Verbindungsfehler – Seite neu laden" where "Seite neu laden" is a clickable `<button>` that calls `window.location.reload()`.

## Beschreibung

UX-015 hat den error-Text von leer auf "Verbindungsfehler – bitte Seite neu laden" verbessert. Das ist ein Fortschritt. Aber "bitte Seite neu laden" ist eine Aufforderung ohne Mittel zur Ausführung: Es gibt keinen Button, keinen Link, keine direkte Möglichkeit, die Seite per Klick neu zu laden.

Zwei konkrete Probleme:

**1. Mobile ohne Hardware-Taste:** Auf Smartphones (besonders iOS Safari) ist das manuelle Neu-Laden über den Browser nicht offensichtlich. Viele Nutzer kennen den Reload-Button im Browser nicht oder er ist bei Vollbild-PWA-Nutzung nicht sichtbar.

**2. A11y: role="status" mit aria-live="polite" im error-State:** Der ConnectionIndicator nutzt `role="status"` und `aria-live="polite"` für alle Zustände inklusive Error. Bei einem permanenten Verbindungsfehler ist "polite" falsch – Screen Reader lesen die Meldung erst vor wenn gerade nichts anderes gesprochen wird, was bei einer aktiven Timer-View erheblich verzögert sein kann. Ein Verbindungsfehler ist ein kritischer Zustand der sofortige Aufmerksamkeit erfordert.

## Steps to Reproduce

1. Öffne ModeratorView oder ParticipantView auf Mobile (375px)
2. Unterbreche die Verbindung dauerhaft (Netzwerk deaktivieren, Seite nicht neu laden)
3. ConnectionIndicator wechselt in error-State
4. Expected: Eine klickbare "Seite neu laden"-Aktion direkt im Indicator; Screen Reader kündigt den Fehler sofort an (assertive)
5. Actual: Nur Text ohne Aktion; polite-Announcement kann verzögert oder von anderen Sprachausgaben überlagert sein

## Empfehlung

Im error-State den Indicator um einen Button "Neu laden" (`onClick={() => window.location.reload()}`) erweitern. Alternativ genügt ein `<button>`-Element im Inline-Stil. Zusätzlich: Im error-State `role="alert"` und `aria-live="assertive"` verwenden statt `role="status"` / `aria-live="polite"`. Die einfachste Lösung wäre, den role/aria-live je nach Status dynamisch zu setzen.

## Priority

Fix before release
