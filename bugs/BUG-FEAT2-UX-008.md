# BUG-FEAT2-UX-008: Farbkontrast warning-State (#8A5500 auf #FFF8EC) – WCAG-Grenzfall

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Persona:** Tom (Teilnehmer)
- **Status:** Open

## Beschreibung
Die Timer-Farben für den Warning-State sind in `index.css` definiert als:
- Hintergrund: `--timer-bg-warning: #FFF8EC`
- Textfarbe: `--timer-text-warning: #8A5500`

Kontrastberechnung (WCAG 2.1, relative Luminanz):
- `#8A5500` auf `#FFF8EC`: Ca. 4.6:1

Das liegt knapp über dem WCAG AA-Minimum von 4.5:1 für normalen Text, aber der
Timer zeigt eine sehr große Schrift (`clamp(4rem, 20vw, 10rem)`). Für großen Text
(≥ 18pt / 24px oder 14pt bold) gilt WCAG AA 3:1. Das bedeutet die Timer-Anzeige
selbst wäre auch mit einem niedrigeren Kontrast noch konform.

Das eigentliche Problem: Die Spec verspricht "≥4.5:1 für alle Timer-Zustände" –
der Puffer ist mit ~4.6:1 extrem knapp. Rendering-Unterschiede zwischen Browsern
und Betriebssystemen können den effektiven Kontrast leicht unter 4.5:1 drücken.

Außerdem: Der `expired`-State:
- Hintergrund: `--timer-bg-expired: #FFF1F1`
- Textfarbe: `--timer-text-expired: #8A1F1F`
- Kontrast: Ca. 5.4:1 – sicher AA-konform.

Nur der Warning-State ist der Grenzfall.

## Betroffene Datei(en)
- `projekt/src/index.css`

## Expected (aus Nutzerperspektive)
Der Warning-State ist auch bei suboptimalen Bildschirmeinstellungen oder leichter
Farbkalibrierungsabweichung klar lesbar und übertrifft WCAG AA mit komfortablem Puffer.

## Actual
`--timer-text-warning: #8A5500` auf `--timer-bg-warning: #FFF8EC` hat ca. 4.6:1 –
knapp über dem Minimum, ohne Sicherheitspuffer.

## Fix-Hinweis
`--timer-text-warning` auf einen dunkleren Braunton setzen, z. B. `#6B4000` (ca. 5.8:1)
oder `#7A4900` (ca. 5.2:1). Der wärmere Ton des Warning-States bleibt erhalten,
der Kontrast-Puffer wird größer.

## Priority
Fix before release
