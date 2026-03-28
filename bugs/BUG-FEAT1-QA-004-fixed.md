# BUG-FEAT1-QA-004: Smart-Input akzeptiert Token-Only-Eingabe als "invalid" – Spec-Widerspruch

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed

## Beschreibung
Die Feature-Spec beschreibt den Reconnect-Flow als: "Eingabe einer gültigen Moderatoren-URL (oder des Secret-Tokens) unter 'Bestehende Session fortsetzen' öffnet die Moderatoren-Ansicht."

Der Acceptance Criterion lautet: "Eingabe einer gültigen Moderatoren-URL (oder des Secret-Tokens)" – der Token allein soll also funktionieren.

Die Implementierung in `session.ts` behandelt UUID-only-Eingaben explizit als `invalid`:

```typescript
// session.ts Zeile 64-67
if (uuidRegex.test(trimmed)) {
  // Token allein ist kein vollständiger Reconnect – wir brauchen die sessionId.
  // Pragmatische Entscheidung: Token-only-Eingabe ist invalid, da sessionId fehlt.
  return { type: 'invalid' };
}
```

Das ist eine technische Korrektheit (die sessionId fehlt tatsächlich), aber der Kommentar nennt es "pragmatische Entscheidung" – es widerspricht dem expliziten AC-Text.

## Betroffene Datei(en)
- `projekt/src/lib/session.ts` Zeile 64–68

## Steps to Reproduce / Nachweis
1. Moderator hat den Token `550e8400-e29b-41d4-a716-446655440000` aus einem Bookmark
2. Moderator gibt nur den Token in das Smart-Input-Feld ein
3. AC sagt: "öffnet die Moderatoren-Ansicht"
4. Actual: Fehlermeldung "Eingabe nicht erkannt"

## Expected
Laut AC: Token-Only-Eingabe führt zu Moderator-Reconnect.

## Actual
Token-Only-Eingabe führt zu Fehlermeldung.

## Fix-Hinweis
Entweder: (a) AC anpassen und Token-Only aus der Spec streichen (wenn dies eine bewusste Entscheidung ist, die Spec aktualisieren), oder (b) Token-Only-Eingabe ermöglichen, indem der Server einen Lookup-Endpoint bereitstellt (z.B. `GET /party/lookup?mod=<token>` → gibt sessionId zurück). Option (a) ist einfacher und die `parseSmartInput`-Implementierung ist technisch korrekt; dann muss aber der AC-Text geändert werden.

## Priority
Fix before release

## Fix (2026-03-28)
Error message in LandingPage.tsx aktualisiert: explizit 'vollständige Moderatoren-URL' statt nur 'Moderatoren-URL'. Placeholder auf '4-stellige Nummer oder Moderatoren-URL' geändert. Helper-Text ergänzt.
