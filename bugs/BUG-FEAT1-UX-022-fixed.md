# BUG-FEAT1-UX-022: LandingPage reconnectError erscheint im SmartInput-Bereich, aber Fehler kann vom "Neue Session"-Flow stammen

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Flow | Konsistenz
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Der UX-019-Fix übergibt `state: { reconnectError: '...' }` wenn ROOM_EXISTS nach 3 Versuchen erschöpft ist. Die LandingPage zeigt diesen Fehler als `inputError` im SmartInput-Bereich an (Zeile 16: `useState(locationState.reconnectError ?? null)`).

Das ist konzeptionell falsch: Der Fehler ist kein Eingabe-Fehler im SmartInput (dort hat der User gar nichts eingegeben), sondern ein Fehler des primären "Neue Session starten"-Buttons. Der Fehlertext erscheint unterhalb des Smart-Input-Feldes – räumlich beim Reconnect-Bereich – obwohl der User gerade versucht hat, eine *neue* Session zu starten.

Für den User entsteht folgendes:
1. Mia klickt "Neue Session starten"
2. Sie landet auf der LandingPage, der Fehlertext "Konnte keine freie Session erstellen..." erscheint unter dem Input-Feld im unteren Bereich der Seite
3. Der primäre Button hat keinerlei Bezug zum Fehler – der Fehler steht visuell und semantisch am falschen Ort

Zusätzlich: `aria-invalid` wird auf das Input-Feld gesetzt wenn `inputError` gesetzt ist (Zeile 159). Das bedeutet, Screen Reader lesen das Input-Feld als invalid an, obwohl der User es gar nicht benutzt hat. Das ist semantisch falsch.

## Steps to Reproduce

1. Simuliere ROOM_EXISTS-Erschöpfung (3 Versuche scheitern)
2. LandingPage öffnet sich mit `state.reconnectError` gesetzt
3. Expected: Fehlermeldung erscheint beim "Neue Session starten"-Bereich (primärer Kontext) oder als eigenständige Benachrichtigung oberhalb des primären Buttons
4. Actual: Fehlermeldung erscheint unterhalb des SmartInput-Feldes; Input-Feld wird als `aria-invalid` markiert, obwohl der User es nicht verwendet hat

## Empfehlung

LandingPage sollte `reconnectError` aus dem State als eigenen Fehlertyp behandeln, der:
- Visuell beim primären Button-Bereich erscheint (z.B. als `<p role="alert">` unter dem "Neue Session starten"-Button)
- Oder als bannerartige Fehlermeldung ganz oben im Formular-Container
- Nicht `aria-invalid` auf das Input-Feld setzt, wenn der Fehler nicht durch Eingabe entstanden ist

Alternativ: Ein separates `primaryError`-State neben dem bestehenden `inputError`-State einführen.

## Priority

Fix before release
