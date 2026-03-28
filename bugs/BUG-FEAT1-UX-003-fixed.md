# BUG-FEAT1-UX-003: Fehlerstate "Ungültiger Token" ohne Handlungsoption – User ist blockiert

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Flow
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Fixed

## Beschreibung
Wenn ein Moderator eine URL mit ungültigem Token aufruft, zeigt `ModeratorView.tsx` (Zeilen 84–92)
eine Fehlermeldung an (`"Ungültiger Moderatoren-Token. Bitte die Moderatoren-URL überprüfen."`)
– aber es gibt keinen Link zurück zur Startseite, keinen "Neuen Versuch starten"-Button und
keine weitere Handlungsoption. Der Nutzer sitzt in einer Sackgasse.

Zum Vergleich: Der `sessionExpired`-State in derselben Komponente bietet einen Link
"Neue Session starten" zurück zur Startseite (Zeilen 47–82). Diese Konsistenz fehlt beim
Token-Fehler.

## Betroffene Datei(en)
- `projekt/src/components/ModeratorView.tsx`

## Expected (aus Nutzerperspektive)
Mia sieht eine verständliche Fehlermeldung und hat direkt die Möglichkeit, entweder zur
Startseite zurückzukehren oder eine neue Session zu starten – ohne den Browser-Back-Button
benutzen zu müssen.

## Actual
Die Fehlermeldung erscheint allein in einem `div` ohne jegliche Navigationsoption.
Mia muss selbst wissen, die Adressleiste zu ändern oder den Browser-Zurück-Button zu nutzen.

## Fix-Hinweis
Das INVALID_TOKEN-Fehler-Template analog zum `sessionExpired`-State um einen Link
zur Startseite (`<Link to="/">Zurück zur Startseite</Link>`) ergänzen.

## Priority
Fix before release
