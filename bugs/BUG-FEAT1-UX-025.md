# BUG-FEAT1-UX-025: inputMode wechselt bei 5 Zeichen von "numeric" zu "text" – mitten in der URL-Eingabe erscheint falsche Tastatur

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** UX | Mobile
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

LandingPage.tsx Zeile 21:

```tsx
const inputMode = inputValue.length <= 4 ? 'numeric' : 'text';
```

Die Logik ist: bei bis zu 4 Zeichen → numerische Tastatur (für Session-Nummern), bei mehr als 4 → normale Tastatur (für Moderatoren-URLs).

Das Problem ist der Wechsel-Moment. Wenn ein Moderator seine Moderatoren-URL eingibt und das fünfte Zeichen tippt, wechselt die Tastatur live von Numpad auf normale Tastatur. Auf iOS und Android kann dieser Wechsel die Tastatur kurz ein- und ausblenden oder eine sichtbare Neudarstellung verursachen – das ist eine merkliche UX-Unterbrechung.

Zudem: Wer eine URL einfügt (Paste aus Clipboard), sieht diese Unterbrechung nicht – dort ist es kein Problem. Das Problem betrifft gezielt Nutzer, die ihre Moderatoren-URL per Tastatur eintippen. Das ist zwar ein seltener Fall, aber er existiert.

Schwerwiegender: Wenn jemand versehentlich eine 5-stellige Zahl eingibt, wechselt die Tastatur auf Text – und die Fehlermeldung ("Eingabe nicht erkannt") erscheint erst nach Submit. Der Keyboard-Wechsel könnte den User zusätzlich verwirren.

## Steps to Reproduce

1. Öffne LandingPage auf iOS Safari (375px)
2. Tippe im Smart-Input-Feld "12345" (5 Ziffern)
3. Expected: Tastatur bleibt konsistent; oder: Wechsel passiert unauffällig ohne sichtbare Keyboard-Unterbrechung
4. Actual: Nach dem 5. Zeichen wechselt die virtuelle Tastatur von Numpad zu QWERTY-Tastatur – ein sichtbarer Sprung

## Empfehlung

Zwei mögliche Ansätze:

**Option A (simpel):** `inputMode` fest auf `'text'` setzen und `'numeric'` nur für ein dediziertes, separates Eingabefeld für Session-Nummern verwenden. Das Smart-Input-Konzept verträgt sich schlecht mit dynamischen inputMode-Wechseln.

**Option B (besser):** Den inputMode-Wechsel erst nach einem Blur/Re-Focus auslösen statt live bei jedem Tastendruck, um den Tastaturwechsel zu entkoppeln. In der Praxis bedeutet das: inputMode basiert auf dem letzten Submit-Versuch oder einem expliziten Modus-State, nicht live auf `inputValue.length`.

## Priority

Nice-to-have
