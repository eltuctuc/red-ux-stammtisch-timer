# BUG-FEAT2-UX-004: Idle-Zustand zeigt "00:00" – für Teilnehmer nicht von abgelaufenem Timer unterscheidbar

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** UX | Feedback
- **Gefunden von:** UX Reviewer
- **Persona:** Tom (Teilnehmer)
- **Status:** Open

## Beschreibung
Im `idle`-Zustand (kein Timer gestartet, keine Dauer gewählt) zeigt `TimerDisplay` den Wert
`"00:00"`, da `displayMs` aus `ModeratorView`/`ParticipantView` bei `timerState === null` als `0`
initialisiert wird, und `formatTime(0)` den String `"00:00"` zurückgibt.

Tom öffnet als Teilnehmer die Session-URL. Er sieht "00:00" auf dem Bildschirm.
Mögliche Interpretationen für Tom:
1. Der Timer ist abgelaufen (Zeit ist um)
2. Es wurde noch kein Timer gestartet
3. Die Verbindung ist fehlerhaft

Da `idle` und `expired` sich außerdem das gleiche visuelle Styling teilen
(beide `bgMap['idle']` und `bgMap['expired']` sind zwar unterschiedlich, aber `expired` hat
einen leicht rötlichen Hintergrund), und Toms Ansicht die Steuerelemente nicht zeigt,
fehlt jeder kontextuelle Hinweis auf den tatsächlichen Zustand.

Laut FEAT-2-Spec:
> *"Leerer Zustand: Timer startet immer mit 00:00 und wartet auf Preset-Auswahl."*
Das gilt für den Moderator, der die Steuerelemente sieht. Für Tom gibt es keine
entsprechende Orientierung.

## Betroffene Datei(en)
- `projekt/src/components/ParticipantView.tsx`
- `projekt/src/components/TimerDisplay.tsx`

## Expected (aus Nutzerperspektive)
Tom sieht einen klaren Hinweis, dass noch kein Timer läuft und er warten soll –
kein reines "00:00" das ihn im Unklaren lässt.

## Actual
`ParticipantView` zeigt im idle-Zustand "00:00" ohne weiteren Hinweis.
Ein Teilnehmer, der direkt nach dem Beitreten auf "00:00" starrt, könnte denken
die Zeit ist abgelaufen oder etwas ist schiefgegangen.

## Fix-Hinweis
In `ParticipantView` (oder in `TimerDisplay` als optionales `statusText`-Prop)
für den `idle`-Zustand einen ergänzenden Text einblenden:
z. B. "Warten auf nächsten Timer..." unterhalb der Zeitanzeige.
Alternativ: "00:00" im idle-Zustand ersetzen durch einen Dash oder einen
Wartezustand-Text (erfordert Anpassung in `TimerDisplay`).

## Priority
Fix before release
