# BUG-FEAT1-UX-001: Fehlende Umlaute in Fehlermeldungen und UI-Texten

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Copy
- **Gefunden von:** UX Reviewer
- **Persona:** Beide
- **Status:** Open

## Beschreibung
In mehreren Komponenten fehlen deutsche Umlaute in sichtbaren Texten. Betroffen sind mindestens:
- `SessionPage.tsx` Zeile 29: `"Ungultige Session-Nummer."` (statt "Ungültige")
- `SessionPage.tsx` Zeile 37: `"Zuruck zur Startseite"` (statt "Zurück")
- `ModeratorView.tsx` Zeile 89: `"Ungultiger Moderatoren-Token."` (statt "Ungültiger")
- `ModeratorView.tsx` Zeile 89: `"uberprufen"` (statt "überprüfen")
- `ShareSection.tsx` Zeile 89: `"Link fur Teilnehmer"` (statt "für")
- `ParticipantView.tsx` Zeile 52: `"Zuruck zur Startseite"` (statt "Zurück")
- `LandingPage.tsx` Zeile 89: `"Echtzeit-Timer fur Workshops"` (statt "für")

Dies erzeugt beim deutschen Nutzer sofort den Eindruck eines unfertigen oder fehlerhaften Produkts.

## Betroffene Datei(en)
- `projekt/src/components/SessionPage.tsx`
- `projekt/src/components/ModeratorView.tsx`
- `projekt/src/components/ShareSection.tsx`
- `projekt/src/components/ParticipantView.tsx`
- `projekt/src/components/LandingPage.tsx`

## Expected (aus Nutzerperspektive)
Korrekte deutsche Schreibweise mit Umlauten: "Ungültige", "Zurück", "für", "überprüfen".

## Actual
Fehlermeldungen und UI-Labels erscheinen mit fehlenden Umlauten als "Ungultige", "Zuruck", "fur" – wirkt auf deutschsprachige Nutzer wie ein Encoding-Fehler oder ein nicht fertiggestelltes Produkt.

## Fix-Hinweis
Alle String-Literale in den betroffenen Komponenten auf korrekte UTF-8-Umlaute prüfen und ersetzen. Wahrscheinlich ein Encoding-Problem bei der Code-Generierung oder beim Speichern der Dateien. Suche nach `u`, `a`, `o` in deutschen Wörtern wo Umlaut erwartet wird.

## Priority
Fix now
