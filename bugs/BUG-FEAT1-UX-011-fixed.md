# BUG-FEAT1-UX-011: "Wird gestartet..."-State täuscht Server-Request vor – Loading dauert < 1ms

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** UX | Copy
- **Gefunden von:** UX Reviewer
- **Status:** Fixed

## Problem

In `LandingPage.tsx` (Zeilen 16–25) setzt `handleNewSession` den State `isStarting = true` und navigiert unmittelbar danach synchron mit `navigate()`. Es gibt kein `await` auf einen Server-Request. Der Code lautet:

```tsx
async function handleNewSession() {
  setIsStarting(true);
  try {
    const sessionId = generateSessionId();
    const modToken = generateModToken();
    navigate(`/session/${sessionId}?mod=${modToken}`);
  } finally {
    setIsStarting(false);
  }
}
```

`generateSessionId()` und `generateModToken()` sind rein synchrone, lokale Operationen. `navigate()` leitet sofort weiter. Der `finally`-Block wird zwar ausgeführt, aber da nach `navigate()` die Komponente unmountet, hat `setIsStarting(false)` keinen sichtbaren Effekt mehr.

Der Button zeigt daher "Wird gestartet..." für faktisch 0ms (ein einziges Render-Frame, falls überhaupt). Der Nutzer sieht diese Meldung nicht – oder nur als kurzes Flackern.

**Das eigentliche UX-Problem:** Die Spec (FEAT-1, Abschnitt 2) beschreibt einen Loading-State während des Server-Requests. Laut technischem Design (Abschnitt 3) ist die Session-Erstellung tatsächlich eine WebSocket-Verbindung auf dem SessionPage, nicht ein Request auf der LandingPage. Der Loading-State auf der LandingPage macht daher konzeptionell keinen Sinn und entspricht nicht dem tatsächlichen Ablauf.

Der Nutzer erwartet beim Klick auf "Neue Session starten" visuelles Feedback. Dieses fehlt in der Praxis. Der ConnectionIndicator auf der SessionPage übernimmt das – aber der Übergang ist abrupt ohne jeden visuellen Hinweis auf der LandingPage.

## Steps to Reproduce
1. Öffne die Landing Page
2. Klicke "Neue Session starten"
3. Expected: Kurzes, sichtbares Loading-Feedback vor dem Redirect
4. Actual: Sofortiger Redirect ohne wahrnehmbares Feedback; "Wird gestartet..."-Text ist nicht sichtbar

## Empfehlung
Entweder den Loading-State entfernen da er technisch nicht belegt ist (sofortiger Redirect ist korrekt), oder ein minimales `await new Promise(r => setTimeout(r, 0))` einbauen damit der Browser den State tatsächlich rendern kann. Ehrlicher wäre ersteres: Button-Text bleibt "Neue Session starten", Redirect ist sofort.

## Priority
Nice-to-have

## Fix (2026-03-28)
isStarting-State aus LandingPage.tsx entfernt. handleNewSession ist nun synchron – kein täuschender Loading-State mehr. Button navigiert direkt.
