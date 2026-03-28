# BUG-FEAT1-UX-016: "Neue Session starten"-Button ohne Loading-State – Spec-Anforderung nicht erfüllt

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** UX | Feedback | Flow
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Open

## Beschreibung

BUG-FEAT1-UX-011 hat den fälschlich implementierten `isStarting`-Loading-State entfernt, der einen Server-Request vortäuschte, der nicht stattfindet. Das war korrekt.

Das Problem: Die Feature-Spec (Abschnitt 2, Interaktionsmuster) beschreibt explizit:

> "Ladeverhalten: 'Neue Session starten'-Button zeigt Loading-State während Server-Request, danach sofortiger Redirect (kein Spinner-Overlay)"

Der Redirect passiert nun synchron ohne Server-Request – die Spec-Formulierung ist damit technisch überholt. Aber aus Nutzerperspektive gibt es jetzt gar kein Feedback zwischen Klick und Redirect: Der Button reagiert auf den Klick nicht sichtbar (kein Pressed-State, kein kurzes "Wird gestartet..."), bevor die Seite wechselt.

Auf schnellen Verbindungen ist das kein Problem. Wenn React Router jedoch einen Moment braucht um die neue Route zu rendern (erstes Laden der ModeratorView, Netzwerk-Latenz für Inter-Font, etc.), gibt es eine kurze Lücke ohne visuelles Feedback. Der User weiß nicht ob der Klick registriert wurde.

Zusätzlich: Der Button hat keinen expliziten `aria-busy`- oder `disabled`-State während des Navigierens, was Double-Clicks ermöglicht, die mehrere Sessions erzeugen könnten.

## Steps to Reproduce

1. Öffne die LandingPage (/) auf einem langsamen Gerät oder mit gedrosselter CPU (DevTools 4x slowdown)
2. Klicke auf "Neue Session starten"
3. Expected: Kurzes visuelles Feedback ("Wird gestartet..." oder disabled-State) bevor der Redirect
4. Actual: Kein Feedback – direkt Redirect ohne Zwischenzustand. Bei langsamem Rendering entsteht eine stumme Lücke.

## Empfehlung

Einen kurzen `isNavigating`-State setzen (nur für den synchronen Redirect-Moment), der den Button als `disabled` markiert und den Text zu "Wird gestartet..." ändert. Da der Redirect synchron ist, bleibt dieser State nur eine Frame – er verhindert aber Double-Clicks und gibt dem User die Bestätigung, dass der Klick registriert wurde.

## Priority

Nice-to-have
