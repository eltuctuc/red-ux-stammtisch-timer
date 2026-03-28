# BUG-FEAT1-QA-008: Session-Expiry-Alarm wird bei Session-Erstellung nicht gesetzt – AC-12 für inaktive Sessions nicht erfüllt

- **Feature:** FEAT-1 – Session Management
- **Severity:** High
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Steps to Reproduce
1. Moderator erstellt eine neue Session (navigiert zu `/session/1234?mod=<token>`)
2. Server-seitiger `onConnect` in `timer.ts` nimmt den modToken entgegen und speichert ihn
3. Moderator schließt den Tab sofort, ohne jemals einen Timer zu starten
4. Nach 3 Stunden: kein Session-Expiry-Alarm feuert
5. Expected: Session wird nach 3 Stunden Inaktivität serverseitig beendet (AC-12)
6. Actual: Session läuft unbegrenzt weiter; Room existiert im PartyKit Durable Object ohne jemals zu verfallen

## Technischer Nachweis

```typescript
// timer.ts Zeile 27-34: Constructor setzt keinen Alarm
constructor(readonly room: Party.Room) {
  this.state = {
    modToken: null,
    timer: defaultTimerState(),
    lastActivityAt: Date.now(),
    alarmType: 'session',
  };
  // Kein: void this.room.storage.setAlarm(Date.now() + 3 * 60 * 60 * 1_000);
}
```

Der Session-Expiry-Alarm wird ausschließlich in den `onMessage`-Handlern gesetzt (START, PAUSE, RESUME, RESET – timer.ts Z.129, Z.143, Z.156). Bei einer Session ohne jede Timer-Aktivität wird kein Alarm je gesetzt.

## Betroffener AC
AC-12: "Eine Session verfällt serverseitig nach 3 Stunden ohne neuen Timer-Start."

Der AC spricht von "ohne neuen Timer-Start" – das bedeutet explizit auch Sessions, die nie gestartet werden.

## Zusätzliche Auswirkung
Da PartyKit Durable Objects kostenpflichtig nach Speicher und Laufzeit abgerechnet werden, akkumulieren nie ablaufende Sessions Betriebskosten. Zusätzlich: Session-Nummern (1000-9999 = max. 9000 IDs) werden durch nie ablaufende Sessions dauerhaft blockiert.

## Priority
Fix before release
