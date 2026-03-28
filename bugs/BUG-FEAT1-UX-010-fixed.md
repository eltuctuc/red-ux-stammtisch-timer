# BUG-FEAT1-UX-010: ParticipantView zeigt bei Verbindungsaufbau keinen Loading-State für den Timer

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** UX | Feedback
- **Gefunden von:** UX Reviewer
- **Status:** Fixed

## Problem

Wenn ein Teilnehmer die Session-URL direkt aufruft (z.B. über den geteilten Link), baut `ParticipantView.tsx` eine WebSocket-Verbindung auf. Während des Verbindungsaufbaus (`connectionStatus === 'connecting'`) rendert die Komponente sofort den `TimerDisplay` mit Standardwerten:
- `status = 'idle'`
- `displayMs = 0`
- `isWarning = false`

Der Nutzer sieht damit direkt nach dem Seitenaufruf einen Timer mit "00:00" und dem Idle-Zustand – ohne zu wissen ob dies der echte Zustand ist oder ob die App noch lädt.

Der `ConnectionIndicator` zeigt zwar den Verbindungsstatus an, er ist aber unterhalb des Timers positioniert. Der Timer selbst gibt kein Feedback, dass er noch nicht synchronisiert ist.

**Konkrete Nutzersituation:** Lea (Teilnehmerin) öffnet den Link kurz nach dem Meeting-Start. Der Moderator hat bereits einen Timer auf 10:00 eingestellt. Lea sieht für ~200–500ms "00:00 idle" – ein falscher, verwirrter erster Eindruck. Erst nach erfolgreichem Connect springt der Timer auf den korrekten Wert.

Dies ist besonders kritisch wenn die Verbindung länger dauert (schlechtes Netz): Der Teilnehmer könnte "00:00" für den echten Timer-Wert halten.

## Steps to Reproduce
1. Moderator startet eine Session mit 10-Minuten-Timer
2. Teilnehmer öffnet die Teilnehmer-URL auf einem langsamen Netz
3. Expected: Timer zeigt einen Loading-State (z.B. "--:--" oder Skeleton) bis die Verbindung steht
4. Actual: Timer zeigt sofort "00:00" mit Idle-State – potenziell irreführend

## Empfehlung
Während `connectionStatus === 'connecting'` den Timer mit einem neutralen Platzhalter-Zustand darstellen, z.B.:
- `displayMs` als `null` übergeben und im `TimerDisplay` "--:--" anzeigen
- Oder einen dezenten Skeleton/Shimmer für den Timer-Bereich während des Verbindungsaufbaus

Der ConnectionIndicator allein reicht nicht – er ist semantisch zu weit vom Timer-Inhalt entfernt.

## Priority
Fix before release

## Fix (2026-03-28)
ParticipantView: displayMs=null während connecting+kein timerState. TimerDisplay zeigt '--:--' für null (statt '00:00'). aria-label wechselt auf 'Verbindung wird aufgebaut'.
