# Product Requirements Document
*Erstellt: 2026-03-27*

## Vision
Ein geteilter, synchronisierter Countdown-Timer für Online-Workshops – Moderatoren starten Sessions, Teilnehmer folgen in Echtzeit über eine gemeinsame Session-Nummer.

## Zielgruppe
Primär: Workshop-Moderatoren (Scrum Retros, Coffee Talks, Timeboxing-Sessions)
Sekundär: Workshop-Teilnehmer (read-only Zuschauer des Timers)

## Kernproblem
In Online-Workshops gibt es kein einfaches Mittel, einen Countdown für alle sichtbar zu starten – Moderatoren suchen jedes Mal neu nach Tools, Teilnehmer sehen nichts.

## Scope (In)
- Moderator öffnet Haupt-URL → neue Session wird erstellt mit zufälliger Session-Nummer
- Moderator erhält zwei Links: Moderatoren-URL (mit Secret-Token, volle Kontrolle) und Teilnehmer-URL (read-only)
- Teilnehmer können alternativ auf der Haupt-URL ihre Session-Nummer eingeben
- Moderator steuert Timer: Start, Pause, Reset, Preset-Auswahl
- Feste Presets: 2, 5, 10, 15, 30 Minuten + individuelle Zeiteingabe
- Alle Teilnehmer mit derselben Session-Nummer sehen den Timer in Echtzeit synchronisiert
- Sound-Alert für alle wenn Timer abläuft
- Session verfällt nach 3 Stunden ohne neuen Timer-Start
- Moderator kann Tab schließen und per Moderatoren-URL die Session wieder übernehmen
- Cleanes Design mit definiertem Farbset (siehe unten)
- Moderator kann Teilnehmer-URL per Copy-Button teilen (für Meeting-Chat); alternativ reicht die Session-Nummer zur manuellen Eingabe auf der Haupt-URL

## Out-of-Scope
- Nutzer-Accounts oder Registrierung
- Mehrere gleichzeitige Timer pro Session
- Sequenz-Timer (mehrere Timeboxen hintereinander)
- Admin-Oberfläche für Sessions

## Erfolgskriterien
- Timer läuft bei allen Teilnehmern synchron (max. ~1 Sek. Versatz)
- Session-Start in unter 10 Sekunden ab Aufruf der Haupt-URL
- Eine Session hält den gesamten Workshop-Tag (mehrere Timer nacheinander)

## Design-Tokens

```css
:root {
  --timer-bg-running:   #F4F6F8;
  --timer-bg-warning:   #FFF8EC;
  --timer-bg-expired:   #FFF1F1;

  --timer-text-running: #1C2B3A;
  --timer-text-warning: #8A5500;
  --timer-text-expired: #8A1F1F;
}
```

Timer-Zustände: `running` (normal), `warning` (letzte 20% der gesetzten Zeit), `expired` (abgelaufen)
Sound: sanfter Alert-Ton beim Ablauf des Timers

## Offene Fragen
- Keine.

## Scope-Typ
Funktionierender Prototyp
