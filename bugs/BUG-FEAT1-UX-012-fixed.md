# BUG-FEAT1-UX-012: CopyButton-Fehlermeldung wird auf kleinen Screens abgeschnitten

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Feedback | Copy
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Fixed – 2026-03-28 – CopyButton.tsx: whiteSpace/overflow/textOverflow im error-State auf normal/visible/unset gesetzt

## Beschreibung

Der durch BUG-FEAT1-UX-004 eingeführte Fehler-State im CopyButton zeigt den Text "Nicht kopiert – bitte manuell kopieren" auf rotem Hintergrund. Korrekte Intention – aber der Button hat folgende Inline-Styles gesetzt:

```
whiteSpace: 'nowrap'
overflow: 'hidden'
textOverflow: 'ellipsis'
maxWidth: '100%'
```

Der Fehlertext ist mit 39 Zeichen auf kleinen Viewports (375px, typisches iPhone SE/12 Mini) zu lang für einen Button, der nicht die volle Seitenbreite belegt. Durch `whiteSpace: nowrap` bricht der Text nicht um, durch `textOverflow: ellipsis` wird er abgeschnitten: Der User sieht "Nicht kopiert – bitte manuell k…".

Der handlungsrelevante Teil der Meldung ("manuell kopieren") verschwindet – genau der Teil, der dem User sagt was er tun soll. Die Meldung verliert dadurch ihren Informationswert komplett.

Die `whiteSpace: nowrap`-Regel ist für den Normalzustand (URL-Label) sinnvoll, macht für den Fehlerzustand aber den Text unbrauchbar.

## Steps to Reproduce

1. Öffne die Moderatoren-Ansicht auf einem Viewport von 375px Breite
2. Öffne die ShareSection
3. Simuliere einen Clipboard-Fehler (z.B. in einem HTTP-Kontext oder per DevTools Clipboard-Permission blockieren)
4. Klicke auf einen der CopyButtons
5. Expected: Die vollständige Fehlermeldung "Nicht kopiert – bitte manuell kopieren" ist lesbar
6. Actual: Text wird mit "…" abgeschnitten, der handlungsrelevante Teil fehlt

## Empfehlung

Im `copyError`-Zustand `whiteSpace` auf `normal` setzen und `textOverflow` deaktivieren, damit der Fehlertext umbricht. Alternativ den Fehlertext kürzen auf "Nicht kopiert – manuell kopieren" (31 Zeichen) oder ihn als separate Zeile unterhalb des Buttons ausgeben (ähnlich wie die Inline-Fehlermeldung im SmartInput-Formular).

## Priority

Fix before release
