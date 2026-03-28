# BUG-FEAT1-UX-005: Label "Moderatoren-Link" suggeriert Token-only-Eingabe – funktioniert aber nicht

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Copy | Flow
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Fixed

## Beschreibung
Das Label des Smart-Input-Feldes in `LandingPage.tsx` (Zeile 143) lautet:
`"Session-Nummer oder Moderatoren-Link"`

Das Wort "Moderatoren-Link" ist korrekt, wenn Mia die vollständige URL einfügt.
Aber laut FEAT-1-Spec (Abschnitt 2, User Flow) ist der Reconnect-Flow explizit auch für
die Eingabe eines "Moderatoren-Tokens" vorgesehen:
> *"Eingabe: Moderatoren-Token oder vollständige Moderatoren-URL → Reconnect-Flow"*

Die `parseSmartInput`-Funktion in `session.ts` (Zeilen 60–68) erkennt jedoch einen
reinen UUID-Token als `invalid` – mit dem Kommentar "Token allein ist kein vollständiger Reconnect,
da sessionId fehlt". Der Nutzer kann also keinen Token allein eingeben.

Das Label lügt damit nicht direkt – "Moderatoren-Link" ist die URL, kein Token.
Aber: In der Spec steht "Session fortsetzen", was für Mia nach dem Bookmarken einer
Moderatoren-URL bedeutet, die vollständige URL einzufügen. Das Wort "Link" ist dabei korrekt.

Das eigentliche Problem: Das Placeholder-Beispiel `"z.B. 4821"` suggeriert eine
4-stellige Zahl. Für den Reconnect-Flow (Moderatoren-URL mit UUID) gibt es kein Beispiel im
Placeholder, obwohl das der komplexere und weniger intuitive Eingabetyp ist.

## Betroffene Datei(en)
- `projekt/src/components/LandingPage.tsx`

## Expected (aus Nutzerperspektive)
Mia versteht sofort, dass sie hier entweder eine 4-stellige Nummer (als Teilnehmer)
oder ihre vollständige gespeicherte Moderatoren-URL (als Moderatorin) eingeben kann.

## Actual
Der Placeholder "z.B. 4821" gibt nur Hinweis auf den Teilnehmer-Flow. Für den
Moderator-Reconnect-Flow fehlt ein Beispiel oder Hinweistext, was dort einzugeben ist.

## Fix-Hinweis
Placeholder oder Helper-Text unter dem Feld ergänzen, der beide Fälle adressiert:
z. B. `"4-stellige Nummer oder vollständige Moderatoren-URL"`.
Alternativ: zweizeiliger Placeholder oder ein dezenter Helper-Text unterhalb des Feldes.

## Priority
Fix before release

## Fix (2026-03-28)
Placeholder auf '4-stellige Nummer oder Moderatoren-URL' geändert. Helper-Text unterhalb des Input-Felds erklärt beide Eingabemodi.
