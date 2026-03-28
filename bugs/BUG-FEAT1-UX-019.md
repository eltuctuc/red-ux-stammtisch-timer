# BUG-FEAT1-UX-019: ROOM_EXISTS-Retry-Erschöpfung navigiert stumm zur LandingPage

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Flow | Feedback
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Open

## Beschreibung

ModeratorView (Zeilen 26–37) implementiert eine Auto-Retry-Logik bei ROOM_EXISTS-Fehlern: bis zu 3 Versuche mit neu generierten Session-IDs, danach `navigate('/', { replace: true })` ohne State-Übergabe.

Das bedeutet: Wenn nach 3 Versuchen keine freie Session-ID gefunden wird, landet der Moderator auf der LandingPage – ohne Erklärung, ohne Fehlermeldung, ohne seinen bisherigen Kontext. Aus Nutzerperspektive passiert folgendes:

1. Mia klickt "Neue Session starten"
2. Die App navigiert drei Mal stumm (replace: true, keine sichtbare Aktion)
3. Mia landet wieder auf der LandingPage, von der sie gestartet hat
4. Keinerlei Hinweis warum das passiert ist

Dieser Fall ist laut Spec als Edge Case dokumentiert ("4-stellige Nummer bereits vergeben: Server generiert erneut bis eine freie Nummer gefunden ist") und soll transparent gehandhabt werden. Die stille Navigation zur LandingPage widerspricht dem Feedback-Prinzip.

Der Fall ist selten (max. 9999 gleichzeitige Sessions), aber wenn er eintritt ist die Nutzer-Experience brisant: Der Moderator hat gerade einen Workshop starten wollen und landet ohne Erklärung wieder am Anfang.

Hinweis: BUG-FEAT1-QA-013 ("Stille Navigation zur LandingPage nach Retry-Erschöpfung") dokumentiert das technische Problem. Diese UX-Perspektive fokussiert auf das fehlende User-Feedback.

## Steps to Reproduce

1. Simuliere 3 aufeinanderfolgende ROOM_EXISTS-Fehler (alle generierten Session-IDs belegt)
2. Klicke "Neue Session starten" auf der LandingPage
3. Expected: LandingPage zeigt eine verständliche Meldung ("Konnte keine freie Session erstellen – bitte erneut versuchen")
4. Actual: Stille Navigation zurück zur LandingPage ohne jede Rückmeldung; Mia sieht die unveränderte Startseite

## Empfehlung

`navigate('/', { replace: true, state: { reconnectError: 'Konnte keine freie Session erstellen. Bitte versuche es erneut.' } })` – analog zur bestehenden INVALID_TOKEN-Behandlung in ModeratorView (Zeilen 107–117), die bereits State mit Fehlermeldung übergibt. LandingPage rendert diesen State bereits als Inline-Fehler im SmartInput-Bereich; der Primärbereich (Neue Session) könnte analog einen generischen Fehlerhinweis anzeigen.

## Priority

Fix before release
