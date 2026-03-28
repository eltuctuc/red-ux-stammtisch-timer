# BUG-FEAT1-UX-024: SessionPage "Ungültige Session-Nummer" Error-State ohne role="alert"

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

In SessionPage.tsx (Zeilen 31–32) wird bei einer ungültigen Session-ID in der URL ein Fehlertext angezeigt:

```tsx
<p style={{ fontSize: '18px', fontWeight: 500 }}>Ungültige Session-Nummer.</p>
```

Dieser Paragraph hat kein `role="alert"` und kein `aria-live`-Attribut. Das bedeutet: Wenn ein Screen-Reader-User direkt eine URL mit einer ungültigen Session-ID aufruft und die Seite lädt, wird die Fehlermeldung nicht automatisch angekündigt.

Im Vergleich dazu hat der analoge Fehlerfall in ModeratorView (sessionExpired) `role="alert"` korrekt gesetzt (Zeile 105). Die Inkonsistenz zwischen diesen beiden Fehlerzuständen ist ein A11y-Problem.

Zudem hat der zugehörige "Zurück zur Startseite"-Link keine Unterscheidung zur normalen Link-Semantik – das ist akzeptabel, aber der gesamte Error-Screen hat kein `aria-live`-Verhalten für dynamisch gerenderte Zustände.

## Steps to Reproduce

1. Rufe eine URL mit ungültiger Session-ID auf, z.B. `/session/abc`
2. Expected: Screen Reader kündigt die Fehlermeldung "Ungültige Session-Nummer" sofort an
3. Actual: Fehlermeldung wird gerendert, aber nicht als Alert angekündigt – Screen Reader liest möglicherweise nur den Seitentitel oder nichts Relevantes an

## Empfehlung

`role="alert"` auf den Fehler-Paragraph setzen:

```tsx
<p role="alert" style={{ fontSize: '18px', fontWeight: 500 }}>Ungültige Session-Nummer.</p>
```

Konsistenz mit dem `sessionExpired`-Block in ModeratorView herstellen (der dies bereits korrekt macht).

## Priority

Fix before release
