# BUG-FEAT1-UX-008: CopyButton verwendet Unicode-Sonderzeichen als Icons statt SVG

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** UX | Konsistenz
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

In `CopyButton.tsx` (Zeile 62) werden zwei Unicode-Zeichen als visuelle Icons genutzt:
- `⎘` (U+2398, "Helm Symbol") für den Copy-Zustand
- `✓` (U+2713, "Check Mark") für den Kopiert-Zustand

Beide Zeichen haben folgende Rendering-Probleme:

1. **Font-Abhängigkeit:** Das Zeichen `⎘` ist in vielen Systemfonts nicht enthalten. Auf Windows/Android kann es als leeres Rechteck oder Replacement-Character dargestellt werden.
2. **Inkonsistenz:** `⎘` ist kein Standard-Clipboard-Icon. Nutzer erkennen es möglicherweise nicht als "Kopieren"-Affordanz. Das etablierte Icon ist ein gestapeltes Seiten-Icon (wie in Lucide: `Copy`).
3. **Screen Reader:** Das `aria-hidden="true"` verhindert das Vorlesen – korrekt. Aber das Problem ist die visuelle Darstellung, nicht die Semantik.
4. **Design-Konsistenz:** Wenn andere Komponenten SVG-Icons nutzen würden, sind diese Unicode-Zeichen inkonsistent im Stil.

## Steps to Reproduce
1. Öffne ShareSection in der Moderatoren-Ansicht
2. Betrachte den CopyButton auf Windows (z.B. Chrome ohne Inter-Font-Fallback)
3. Expected: Ein klar erkennbares Clipboard-Icon
4. Actual: Potenziell leeres Rechteck oder unbekanntes Symbol je nach Betriebssystem und Font-Rendering

## Empfehlung
Die Unicode-Zeichen durch inline SVG ersetzen. Beispiel mit einem Lucide-ähnlichen Copy-Icon (zwei übereinanderliegende Rechtecke) und einem Checkmark-SVG für den Kopiert-Zustand. SVGs sind font-unabhängig, skalieren sauber und können per CSS gefärbt werden.

## Priority
Nice-to-have
