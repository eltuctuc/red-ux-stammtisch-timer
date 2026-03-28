# BUG-FEAT2-UX-007: CopyButton verwendet Unicode-Sonderzeichen als Icons (kein SVG)

- **Feature:** FEAT-2 – Timer (betrifft auch FEAT-1)
- **Severity:** Low
- **Bereich:** UX | Konsistenz
- **Gefunden von:** UX Reviewer
- **Persona:** Beide
- **Status:** Open

## Beschreibung
In `CopyButton.tsx` (Zeile 62) werden Unicode-Zeichen als visuelle Icons verwendet:

```tsx
<span aria-hidden="true">{copied ? '✓' : '⎘'}</span>
```

Das Clipboard-Symbol `⎘` (U+2398, "HELM SYMBOL") ist ein obskures Unicode-Zeichen,
das in vielen Fonts nicht oder nur schlecht gerendert wird. Je nach Betriebssystem
und Font kann es als leeres Rechteck erscheinen oder deutlich vom restlichen
Design-System abweichen.

Das Checkmark-Symbol `✓` (U+2713) ist verbreiteter, aber stilistisch nicht
konsistent mit dem restlichen Flat-Design-Ansatz (keine klare Strichbreite, kein
definierter Icon-Set).

Aus den UX-Guidelines (Priority 4: Style Selection):
> *"No Emoji as Structural Icons – Use SVG icons (Heroicons, Lucide), not emojis"*
Das gilt analog für obskure Unicode-Zeichen als Struktur-Icons.

## Betroffene Datei(en)
- `projekt/src/components/CopyButton.tsx`

## Expected (aus Nutzerperspektive)
Das Copy-Icon ist konsistent mit dem visuellen Stil der Anwendung und auf allen
Plattformen sauber gerendert.

## Actual
Das `⎘`-Symbol kann auf manchen Systemen als leeres Rechteck erscheinen
(Font-Abhängigkeit). Das Design wirkt dadurch inkonsistent.

## Fix-Hinweis
Inline-SVG für das Copy-Icon und das Checkmark verwenden (z. B. aus Heroicons
oder Lucide – beide MIT-lizenziert und als Inline-SVG nutzbar ohne zusätzliche
Dependency). Alternativ: die Icons als SVG-Strings hardcoden wenn keine Icon-Library
gewünscht ist.

## Priority
Nice-to-have
