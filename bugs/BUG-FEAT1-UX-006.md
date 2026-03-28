# BUG-FEAT1-UX-006: Moderatoren-URL in ShareSection wird abgeschnitten angezeigt ohne Erklärung

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** UX | Copy
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Open

## Beschreibung
In `ShareSection.tsx` (Zeile 116) wird die Moderatoren-URL auf 60 Zeichen begrenzt angezeigt:
```
{moderatorUrl.slice(0, 60)}&hellip;
```

Eine typische Moderatoren-URL sieht so aus:
`https://example.com/session/4821?mod=xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

Mit 60 Zeichen landet der Schnitt mitten in der URL. Da gleichzeitig daneben ein
"Moderatoren-Link kopieren"-Button vorhanden ist, der die vollständige URL in die
Zwischenablage überträgt, stimmen angezeigter Wert und tatsächlich kopierter Wert nicht überein.

Für Mia, die diesen Link als Bookmark speichern will, könnte dies Vertrauen kosten:
"Kopiert der Button wirklich die vollständige URL?"

## Betroffene Datei(en)
- `projekt/src/components/ShareSection.tsx`

## Expected (aus Nutzerperspektive)
Die URL wird entweder vollständig angezeigt (mit `word-break: break-all` wie bei der
Teilnehmer-URL bereits umgesetzt) oder es ist durch einen Tooltip oder einen Hinweistext
klar, dass trotz der Darstellungskürzung die vollständige URL kopiert wird.

## Actual
Die angezeigte URL endet mit `…` mitten in der URL. Der CopyButton darunter
kopiert die vollständige URL – aber das ist aus der UI nicht erkennbar.

## Fix-Hinweis
Die URL vollständig anzeigen (identisches Markup wie bei der Teilnehmer-URL,
`word-break: break-all`), da `wordBreak: 'break-all'` bereits bei der Teilnehmer-URL
korrekt eingesetzt wird. Alternativ eine kleine Anmerkung "(vollständige URL)" neben dem
Copy-Button ergänzen.

## Priority
Nice-to-have
