# BUG-FEAT2-UX-027: ShareSection Auto-Open fokussiert Button bevor Element sichtbar ist

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y / Focus-Management
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Der Fix für QA-016 + UX-022 in `ShareSection.tsx` enthält folgenden useEffect:

```tsx
useEffect(() => {
  if (initiallyOpen) {
    setIsOpen(true);
    // When isOpen was already true at mount the [isOpen] effect won't re-fire, so
    // trigger focus directly here for that edge case.
    const btn = firstCopyWrapperRef.current?.querySelector<HTMLButtonElement>('button');
    btn?.focus();
  }
}, [initiallyOpen]);
```

Das Problem: `setIsOpen(true)` ist ein asynchroner State-Update – React batcht ihn und führt das DOM-Update erst nach dem aktuellen Effect-Durchlauf durch. Wenn `btn?.focus()` im selben synchronen Block unmittelbar nach `setIsOpen(true)` aufgerufen wird, ist der Inhalt-Container zu diesem Zeitpunkt noch `hidden={true}` (und zusätzlich `display: none`). Ein `focus()` auf ein Element in einem `hidden`-Container hat je nach Browser-Implementierung kein verlässliches Ergebnis: Die meisten Browser ignorieren `focus()` auf nicht sichtbaren Elementen vollständig und werfen keinen Fehler. Der Fokus bleibt dann auf dem zuletzt fokussierten Element oder dem `body` – der CopyButton wird nicht fokussiert.

Der bestehende zweite `useEffect([isOpen])` würde diesen Fall korrekt behandeln (er feuert nach dem DOM-Update), aber er enthält eine `isFirstRender`-Guard, die beim programmatischen Öffnen über `initiallyOpen` greift: Beim Mount (`initiallyOpen = false`) setzt er `isFirstRender.current = false`. Wenn dann `initiallyOpen` zu `true` wechselt, ist `isFirstRender.current` bereits `false`, also feuert der zweite Effect korrekt und setzt den Fokus. Das bedeutet: der manuelle `focus()`-Aufruf im ersten Effect ist für den häufigen Fall (async STATE_UPDATE) **redundant und gleichzeitig ineffektiv** – er feuert auf dem noch versteckten Element.

Nur im Edge-Case "initiallyOpen ist bereits beim Mount true" (theoretisch, in der Praxis nicht erreichbar, da `timerState` beim ersten Render immer `null` ist) würde der `[isOpen]`-Effect nicht feuern, weil `isFirstRender.current` nach dem Mount-Effect bereits `false` ist – und in diesem Fall würde der direkte `focus()`-Aufruf greifen, aber auch dort kommt er zu früh.

Für einen Screenreader-Nutzer, der auf die neue Session-Seite kommt und die ShareSection automatisch geöffnet wird, landet der Fokus nicht auf dem "Teilnehmer-Link kopieren"-Button, sondern bleibt irgendwo im Dokument. Der Nutzer muss manuell navigieren, um den Inhalt der ShareSection zu finden.

## Steps to Reproduce

1. Screenreader aktivieren (z.B. NVDA + Chrome oder VoiceOver + Safari)
2. Neue Session erstellen (Redirect auf `?mod=<token>&new=1`)
3. Warten bis STATE_UPDATE kommt und ShareSection sich öffnet
4. Expected: Fokus springt automatisch auf "Teilnehmer-Link kopieren"-Button
5. Actual: Fokus bleibt auf dem zuletzt fokussierten Element (wahrscheinlich dem Toggle-Button oder dem body); ShareSection-Inhalt ist zwar sichtbar, aber nicht fokussiert

## Empfehlung

Den direkten `btn?.focus()`-Aufruf im `[initiallyOpen]`-Effect entfernen. Der bestehende `[isOpen]`-Effect mit seiner `isFirstRender`-Guard übernimmt das korrekte Fokus-Management nach dem DOM-Update und ist die verlässliche Lösung. Der redundante direkte `focus()`-Aufruf kann zu keinem Zeitpunkt korrekt funktionieren, weil er immer vor dem DOM-Update ausgeführt wird.

Der Kommentar "When isOpen was already true at mount..." beschreibt einen theoretisch nicht erreichbaren Zustand in der aktuellen Implementierung (da `timerState` beim Mount immer `null` ist und `initiallyOpen` damit immer mit `false` initialisiert).

## Priority

Fix before release
