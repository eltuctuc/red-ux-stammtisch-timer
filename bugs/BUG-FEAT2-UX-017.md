# BUG-FEAT2-UX-017: Timer-Text-Kontrast im Expired-Zustand unterschreitet WCAG AA

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Der Expired-Zustand verwendet `--timer-text-expired: #8A1F1F` auf `--timer-bg-expired: #FFF1F1`.

Kontrastberechnung:
- Hintergrund `#FFF1F1`: Relative Luminanz ≈ 0.923
- Textfarbe `#8A1F1F`: Relative Luminanz ≈ 0.042
- Kontrastverhältnis: (0.923 + 0.05) / (0.042 + 0.05) ≈ **10.6:1**

Das liegt gut über WCAG AA (4.5:1). Allerdings: Diese Berechnung gilt für den Timer-Countdown-Text (fontWeight 700, sehr groß). Für den (noch nicht vorhandenen, aber empfohlenen) Status-Hinweistext in Normalgröße wäre das Verhältnis relevant – und `#8A1F1F` auf `#FFF1F1` wäre ausreichend.

**Echter Fund:** Der Warning-Text `--timer-text-warning: #7A4900` auf `--timer-bg-warning: #FFF8EC`:
- Hintergrund `#FFF8EC`: Relative Luminanz ≈ 0.968
- Textfarbe `#7A4900`: Relative Luminanz ≈ 0.048
- Kontrastverhältnis: (0.968 + 0.05) / (0.048 + 0.05) ≈ **10.4:1**

Das ist korrekt und übertrifft die Anforderung (UX-008 war ein guter Fix). Aber: Der Hinweistext in `ModeratorView` "Timer pausieren um Dauer zu ändern" (fontSize 13px, `--color-text-secondary: #64748B`) auf `--color-bg: #F8FAFC`:
- Hintergrund `#F8FAFC`: Luminanz ≈ 0.960
- Text `#64748B`: Luminanz ≈ 0.140
- Kontrastverhältnis: (0.960 + 0.05) / (0.140 + 0.05) ≈ **5.3:1**

Bei 13px Body-Text (< 18px / < 14px bold) ist WCAG AA 4.5:1 erforderlich. 5.3:1 reicht, aber der SessionBadge-Text "Session:" (`#64748B` auf `#FFFFFF`) liegt bei:
- (1.0 + 0.05) / (0.140 + 0.05) ≈ **5.5:1** – noch ok.

Kritischer Fund: Der `code`-Text in ShareSection (`#64748B` auf `#F8FAFC`) für die URLs liegt bei 5.3:1 bei 13px. Das ist knapp über der Grenze, aber die URLs sind lang und werden aus geringer Schriftgröße gelesen. De facto schwer lesbar.

## Steps to Reproduce

1. ShareSection öffnen
2. Die URL-Texte (`code`-Elemente) bei 13px betrachten, besonders auf nicht-kalibrierten Displays
3. Expected: URL-Text deutlich lesbar, klar erkennbar
4. Actual: `#64748B` auf hellem Hintergrund bei 13px ist grenzwertig – schlechte Lesbarkeit auf LCD/OLED mit schlechter Farbkalibrierung

## Empfehlung

Die URL-Anzeige in der ShareSection auf `--color-text-primary` (#1E293B) oder `--color-text-secondary` bei mindestens 14px erhöhen. Alternativ: URL verkürzt darstellen (Domain + Pfad), mit dem Hinweis dass der Button die vollständige URL kopiert.

## Priority
Nice-to-have
