# BUG-FEAT2-UX-028: TimerDisplay zeigt "--:--" ohne visuellen Ladehinweis für sehende Nutzer

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** UX / Leer-Zustand
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Wenn `displayMs === null` ist (Verbindung wird noch aufgebaut, kein STATE_UPDATE empfangen), zeigt `TimerDisplay.tsx` den Wert `--:--` an. Das `aria-label` des `<time>`-Elements ist korrekt auf "Verbindung wird aufgebaut" gesetzt – für Screenreader-Nutzer ist der Zustand also kommuniziert.

Für sehende Nutzer gibt es jedoch keinerlei visuellen Hinweis, dass `--:--` einen Ladezustand bedeutet und nicht etwa einen Fehler oder einen unbekannten Timer-Stand. Die Spec definiert explizit:

> "Bei langsamem Connect: dezenter Verbindungsindikator."

Der `ConnectionIndicator` wird in `ModeratorView` und `ParticipantView` separat unterhalb des Timers gerendert – aber nur wenn der Status `connecting` oder `disconnected` ist. In der Zeitspanne zwischen dem Rendern der Komponente und dem Empfangen des ersten STATE_UPDATEs liegt der Zustand korrekt bei `connectionStatus === 'connecting'`. Der `ConnectionIndicator` sollte also sichtbar sein.

Das tatsächliche UX-Problem ist die Kombination: `--:--` ist ein unbekanntes, neutrales Symbol das keine Ladesemantik vermittelt. Nutzer, die das erste Mal auf die Seite kommen (besonders Teilnehmer, die einem laufenden Timer beitreten), sehen kurzzeitig `--:--` und wissen nicht, ob der Timer noch nicht gestartet wurde, ob die Verbindung fehlt, oder ob ein Fehler vorliegt. Selbst bei kurzen Verbindungszeiten (<500ms) ist dieses kurze Flackern auf `--:--` wahrnehmbar und irritierend.

Die `aria-label`-Lösung im Code ist gut, aber sie adressiert nur Screenreader-Nutzer. Sehende Nutzer haben keinen semantischen Hinweis.

## Steps to Reproduce

1. ParticipantView oder ModeratorView öffnen
2. Seite bei gedrosselter Verbindung laden (Chrome DevTools: Netzwerk auf "Slow 3G" drosseln)
3. Auf den Timer-Bereich schauen, während die Verbindung aufgebaut wird
4. Expected: Entweder ein Skeleton/Shimmer-Effekt im Timer-Bereich, oder ein kurzer visueller Hinweis "Verbinde..." unter dem Timer, oder eine dezente Pulsanimation auf dem `--:--`
5. Actual: Statisches `--:--` ohne erkennbare Ladesemantik; kein visueller Unterschied zu einem Fehler- oder Idle-Zustand

## Empfehlung

Eine der folgenden Optionen:

**Option A (minimal):** In `ModeratorView` und `ParticipantView` einen kurzen Hinweistext rendern wenn `displayMs === null`:
```tsx
{displayMs === null && (
  <p aria-hidden="true" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
    Verbindung wird aufgebaut…
  </p>
)}
```

**Option B (visuell stärker):** Im `TimerDisplay` selbst eine CSS-Pulsanimation auf dem `--:--`-Text aktivieren wenn `displayMs === null` (respektiert `prefers-reduced-motion`).

**Option C (Spec-konform):** Der `ConnectionIndicator` deckt den Fall bereits ab – sicherstellen, dass er in beiden Views bei `connectionStatus === 'connecting'` UND `displayMs === null` immer sichtbar ist und nicht durch Layout-Reihenfolge unter den Fold rutscht.

## Priority

Nice-to-have
