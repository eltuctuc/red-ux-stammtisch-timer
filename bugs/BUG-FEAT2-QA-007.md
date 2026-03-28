# BUG-FEAT2-QA-007: AudioContext wird bei jedem Sound-Event neu erstellt – keine Ressourcen-Freigabe

- **Feature:** FEAT-2 – Timer
- **Severity:** Low
- **Bereich:** Performance
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung
Die `playExpireSound`-Funktion in `useTimerSession.ts` erstellt bei jedem Aufruf einen neuen `AudioContext`:

```typescript
// useTimerSession.ts Zeile 17-35
function playExpireSound() {
  try {
    const ctx = new AudioContext(); // Neuer Context bei jedem Aufruf
    const osc = ctx.createOscillator();
    // ...
    osc.stop(ctx.currentTime + 2.5);
    // ctx.close() wird nie aufgerufen
  } catch { ... }
}
```

`AudioContext` wird nie explizit geschlossen (`ctx.close()` fehlt). Browser haben ein Limit für gleichzeitig offene `AudioContext`-Instanzen (Chrome: 6 pro Tab, Firefox: unbegrenzt aber warnt). Da der Sound nur einmal pro Timer-Ablauf spielt, tritt das Limit in der Praxis kaum auf – aber nach dem Alarm läuft der AudioContext weiter im Hintergrund bis der Garbage Collector ihn einsammelt.

Außerdem: Chrome und Safari können `new AudioContext()` blockieren, wenn keine vorherige User-Interaction stattgefunden hat ("autoplay policy"). Dies wird durch den `try/catch` abgefangen, aber der Sound spielt dann stumm – was laut Edge-Case-Spec akzeptabel ist ("Sound kann nicht abgespielt werden: Timer läuft korrekt weiter"). Der EdgeCase ist damit korrekt behandelt.

Das ressourcen-technische Problem ist das fehlende `ctx.close()` nach `osc.stop()`.

## Betroffene Datei(en)
- `projekt/src/hooks/useTimerSession.ts` Zeile 17–35

## Steps to Reproduce / Nachweis
Browser-DevTools → Memory → `AudioContext` Objekte zählen nach mehreren Timer-Abläufen. Jeder Ablauf hinterlässt eine nicht-geschlossene AudioContext-Instanz.

## Expected
`AudioContext` wird nach Sound-Ende geschlossen.

## Actual
`AudioContext` bleibt offen bis GC eingreift.

## Fix-Hinweis
`osc.addEventListener('ended', () => ctx.close())` hinzufügen, oder `ctx.close()` im `osc.stop`-Callback aufrufen.

## Priority
Nice-to-have
