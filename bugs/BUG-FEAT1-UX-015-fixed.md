# BUG-FEAT1-UX-015: ConnectionIndicator "Verbindungsfehler" ohne Handlungsanweisung

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Feedback | Copy
- **Gefunden von:** UX Reviewer
- **Persona:** Beide (Mia und Lea)
- **Status:** Fixed – 2026-03-28 – ConnectionIndicator.tsx: error-Text um "– bitte Seite neu laden" ergänzt

## Beschreibung

`ConnectionIndicator.tsx` zeigt für den `error`-Status den Text:

```
"Verbindungsfehler"
```

Das ist ein Endzustand ohne Ausweg: Der User sieht eine Fehlermeldung, aber keine Information darüber, was er tun kann. Der `disconnected`-Status hat zumindest den Hinweis "wird neu verbunden..." – der User weiß, dass etwas passiert.

Beim `error`-Status hingegen bleibt die App stumm. Kein Retry-Hinweis, kein "Seite neu laden", kein Link. Der User ist blockiert.

Konkrete Situation: Lea hat schlechtes WLAN, die WebSocket-Verbindung schlägt fehl. Sie sieht einen roten Punkt und "Verbindungsfehler" – und wartet, weil sie nicht weiß ob die App das selbst löst oder ob sie handeln muss.

Laut UX-Guideline `error-recovery` (aus dem UI/UX-Skill): "Error messages must include a clear recovery path (retry, edit, help link)."

## Steps to Reproduce

1. Öffne eine Session-URL (Teilnehmer oder Moderator) mit unterbrochener Verbindung
2. Simuliere einen WebSocket-Fehler (DevTools: Offline-Modus oder Firewall)
3. Expected: "Verbindungsfehler – bitte Seite neu laden" oder ein Retry-Button
4. Actual: Nur "Verbindungsfehler" – keine Handlungsempfehlung, kein Ausweg

## Empfehlung

Den `error`-Statustext um eine Handlungsanweisung erweitern:

```
"Verbindungsfehler – bitte Seite neu laden"
```

Alternativ einen kleinen "Neu laden"-Link ergänzen. Kein vollständiger Fehlerscreen notwendig – der Hinweistext im Indicator reicht.

## Priority

Fix before release
