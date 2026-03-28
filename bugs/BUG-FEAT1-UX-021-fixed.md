# BUG-FEAT1-UX-021: ConnectionIndicator "Seite neu laden"-Button zu kleines Touch-Target

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** A11y | UX
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Der neu eingefügte "Seite neu laden"-Button im ConnectionIndicator (UX-018-Fix) hat kein definiertes Touch-Target. Er wird mit `padding: 0` gerendert und erbt `fontSize: inherit` (13px). Das ergibt eine klickbare Fläche von ca. 13–16px Höhe – weit unter dem WCAG/Apple-Minimum von 44px.

In einem Fehlerzustand, wo der User gestresst ist und auf einem Mobilgerät die Verbindung verloren hat, ist ein 13px-Inline-Textlink als primäre Wiederherstellungsaktion nicht ausreichend erreichbar.

Zusätzlich fehlt ein `aria-label` oder eine semantische Unterscheidung: Der Button hat keinen sichtbaren Fokus-Style (er erbt nur die globale focus-visible-Regel, sofern sie auf `button`-Elemente mit `background: none` greift).

## Steps to Reproduce

1. Öffne ModeratorView auf einem Touch-Gerät (375px)
2. Unterbreche die Netzwerkverbindung dauerhaft
3. ConnectionIndicator wechselt in den error-State
4. Versuche, den "Seite neu laden"-Link zu treffen

Expected: Der Tap-Bereich des Buttons umfasst mindestens 44x44px
Actual: Der Button ist ein Inline-Textelement mit ca. 13px Höhe – zu klein für zuverlässige Tap-Interaktion

## Empfehlung

Den Button mit `minHeight: '44px'` und `padding: '0 var(--space-2)'` ausstatten. Da er inline im Fließtext steht, bietet sich alternativ `display: 'inline-flex'`, `alignItems: 'center'`, `minHeight: '44px'` an, ohne das Layout des Indicators zu sprengen. Oder den gesamten Indicator im error-State als eigenständigen Block mit ausreichend Abstand gestalten.

## Priority

Fix before release
