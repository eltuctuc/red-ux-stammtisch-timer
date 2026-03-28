# BUG-FEAT1-UX-017: CopyButton error-State verursacht Layout-Shift in ShareSection

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Feedback
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Fixed — 2026-03-28
- **Fix:** `CopyButton.tsx` now renders a wrapper `<div>` containing the button + an optional `<p role="alert">` below it. Error text is no longer inside the button, so button height remains constant (44px) in all states. No layout shift in ShareSection.

## Beschreibung

Der Fix für UX-012 setzt `whiteSpace: 'normal'` im error-State des CopyButton, damit der Fehlertext umbricht statt abgeschnitten zu werden. Das ist korrekt. Aber: Der Button hat keine feste Höhe im error-State und keine `minHeight`-Erweiterung für zwei Zeilen. Wenn der Fehlertext "Nicht kopiert – bitte manuell kopieren" umbricht, wächst der Button auf ~zwei Zeilen (~70–80px statt 44px).

In der ShareSection stehen zwei CopyButtons direkt untereinander (Teilnehmer-Link / Moderatoren-Link). Wenn der obere Button in den error-State wechselt und seine Höhe springt, verschiebt sich der zweite Button nach unten. Das ist ein sichtbarer Layout-Shift – genau das Problem, das UX-012 vermeiden wollte.

Auf Desktop (breite Container) ist der Effekt weniger sichtbar, weil mehr Platz vorhanden ist. Auf 375px (Mobile) ist der Fehlertext lang genug um sicher umzubrechen.

## Steps to Reproduce

1. Öffne ModeratorView auf 375px Breite
2. Öffne den ShareSection-Bereich ("Session teilen")
3. Simuliere einen Clipboard-Fehler (DevTools: Permissions > Clipboard > Block) für den Teilnehmer-Link-Button
4. Klicke "Teilnehmer-Link kopieren"
5. Expected: Der Button zeigt den Fehlertext, Layout bleibt stabil
6. Actual: Der Button wächst auf zwei Zeilen, der Moderatoren-Link-Button springt nach unten (Layout-Shift)

## Empfehlung

Den CopyButton im error-State auf `minHeight: 'auto'` belassen, aber die umgebende Wrapper-Komponente (in ShareSection) mit einer `minHeight` absichern, die beide States abdeckt. Alternativ: Den error-Text in einem separaten `<p>`-Element unterhalb des Buttons ausgeben (analog zum Fehlertext im Formular-Pattern), damit die Button-Höhe konstant bleibt. Das wäre konsistenter mit dem Fehler-Pattern im SmartInput der LandingPage.

## Priority

Fix before release
