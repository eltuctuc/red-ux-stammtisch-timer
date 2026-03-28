# BUG-FEAT1-UX-027: ModeratorView sessionExpired-Screen hat keinen Seitentitel / keine h1

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** A11y | UX
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Der sessionExpired-Screen in ModeratorView (Zeilen 92–126) rendert:

```tsx
<p role="alert" style={{ fontSize: '18px', fontWeight: 500 }}>Session abgelaufen.</p>
<p style={{ color: 'var(--color-text-secondary)' }}>Diese Session war 3 Stunden inaktiv und wurde beendet.</p>
<Link to="/">Neue Session starten</Link>
```

Weder ein `<h1>` noch eine strukturelle Überschrift ist vorhanden. Der Bildschirm benutzt `<p>`-Elemente für visuell hervorgehobenen Text.

Für Screen-Reader-User bedeutet das:
- Keine Landmark-Orientierung im Screen (kein Heading-Level)
- Die Heading-Hierarchie der App bricht hier ab
- Browser-Tabs zeigen weiterhin den alten Seitentitel der App (nicht "Session abgelaufen")

Zudem fehlt der semantische Unterschied zwischen dem Alert-Text und dem erklärenden Text – beide sind `<p>`, aber der erste hat `role="alert"`. Ein echter `<h1>` mit dem Text "Session abgelaufen" würde Orientierung bieten und das `role="alert"` wäre für den erklärenden Satz besser aufgehoben.

Das analoge Problem besteht im SessionPage-Fehlerscreen (Zeile 31: `<p>Ungültige Session-Nummer.</p>`).

## Steps to Reproduce

1. Öffne eine abgelaufene Session (sessionExpired-State)
2. Navigiere mit Screen Reader durch Headings (z.B. VoiceOver Rotor: Überschriften)
3. Expected: "Session abgelaufen" als Überschrift navigierbar
4. Actual: Keine Überschrift vorhanden; Screen Reader findet keine h1 auf diesem Screen

## Empfehlung

`<h1>` statt `<p>` für den Haupt-Fehlertitel verwenden:

```tsx
<h1 style={{ fontSize: '18px', fontWeight: 500 }}>Session abgelaufen</h1>
```

`role="alert"` auf den Folgetext setzen, der die Erklärung liefert, oder den Alert zusammen mit `aria-live` als separates Element behandeln. Gleiches Muster für SessionPage-Fehlerscreen anwenden.

## Priority

Nice-to-have
