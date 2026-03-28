# BUG-FEAT2-QA-004: CustomTimeInput – Sekunden-Validierung hat falsche Reihenfolge (Dead Code)

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Fixed — 2026-03-28

## Beschreibung
In `CustomTimeInput.tsx` ist die Validierung der Sekunden außerhalb des gültigen Bereichs (< 0 oder > 59) **Dead Code**, da die `onChange`-Handler bereits alle Nicht-Ziffern-Eingaben entfernen und auf 2 Stellen begrenzen. Relevanter ist: Die Reihenfolge der Validierungen erlaubt es, `99:60` oder `99:61` ... bis `99:99` als gültig passieren zu lassen.

Analyse der Validierungsreihenfolge:
1. `isNaN`-Check – korrekt
2. `totalMs < 1000` – korrekt
3. `mins > 99 || (mins === 99 && secs > 59)` – prüft die 99:59-Grenze
4. `secs < 0 || secs > 59` – prüft Sekunden-Range

**Bug:** Check 3 fängt `99:60` bis `99:99` korrekt ab. Aber Check 4 kommt *nach* Check 3 und wird bei Eingabe von z.B. `50:75` **nicht durch Check 3** gefangen (50 < 99), erst durch Check 4. Das ist korrekt.

**Tatsächlicher Bug:** Bei Eingabe `00:75` passiert Folgendes:
- `mins = 0`, `secs = 75`
- Check 2: `totalMs = (0*60 + 75)*1000 = 75000ms` → > 1000 → kein Fehler
- Check 3: `0 > 99` → false; `0 === 99 && ...` → false → kein Fehler
- Check 4: `75 > 59` → true → Fehler "Sekunden müssen zwischen 0 und 59 liegen"

Soweit korrekt. Aber die `onChange`-Handler begrenzen bereits auf 2 Ziffern (`slice(0, 2)`). Der Nutzer kann maximal `99` eingeben. Bei Sekunden-Eingabe von `75` ist der Fehler damit erreichbar.

**Der echte Bug ist subtiler:** Die `onChange`-Handler entfernen Nicht-Ziffern mit `replace(/\D/g, '')`. Der `parseInt`-Aufruf verwendet `parseInt(seconds || '0', 10)` – wenn der Nutzer `08` oder `09` eingibt, ist `parseInt('08', 10) = 8` korrekt (kein Oktal-Problem bei Basis 10). Aber wenn das Feld leer ist (`''`), wird `'0'` als Default verwendet. Wenn der Nutzer das Minuten-Feld auf `0` lässt und Sekunden leer, entsteht `totalMs = 0` → Check 2 feuert: "Mindestdauer: 1 Sekunde". Das ist korrekt.

**Echter Bug:** Check 4 (`secs < 0 || secs > 59`) ist durch die `onChange`-Sanitisierung (`replace(/\D/g, '').slice(0, 2)`) unerreichbar für `secs < 0` (kann nie negativ sein) und für `secs > 99` (max 2 Stellen). Werte `60`–`99` sind aber erreichbar und werden korrekt durch Check 4 gefangen. Der Check für `secs < 0` ist allerdings tatsächlich Dead Code.

**Tatsächlich kritischer Bug:** Die Maximal-Validierung ist falsch für `mins > 99`. Der `onChange`-Handler begrenzt Minuten auf 2 Stellen (`slice(0, 2)`), also max `99`. Damit kann `mins > 99` nie eintreten. Der Check `mins > 99` ist Dead Code. Die eigentlich aktive Bedingung ist `mins === 99 && secs > 59`. Das bedeutet: Eingabe `99:00` bis `99:59` ist erlaubt. `99:60` bis `99:99` wird gefangen. Das ist korrekt. Aber die Fehlermeldung "Maximaldauer: 99:59" erscheint nur für `99:60`-`99:99`, nicht für generell übermäßige Sekunden (die werden durch Check 4 mit separater Meldung gefangen).

**Zusammenfassung:** Die Reihenfolge der Checks ist suboptimal. Check für `secs < 0` ist Dead Code. Die Gesamtlogik liefert korrekte Ergebnisse, aber mit irreführendem Code.

## Betroffene Datei(en)
- `projekt/src/components/CustomTimeInput.tsx` Zeile 33–41

## Steps to Reproduce / Nachweis
```typescript
// Zeile 33-41
if (mins > 99 || (mins === 99 && secs > 59)) {  // mins > 99: Dead Code
  setError('Maximaldauer: 99:59.');
  return;
}

if (secs < 0 || secs > 59) {  // secs < 0: Dead Code
  setError('Sekunden müssen zwischen 0 und 59 liegen.');
  return;
}
```

## Expected
Validierungslogik ohne Dead Code; Reihenfolge: erst Sekunden-Range prüfen (0-59), dann Gesamt-Maximum (99:59).

## Actual
Dead Code in zwei Bedingungen; funktionell korrekte Ergebnisse, aber unklare Wartbarkeit.

## Fix-Hinweis
Validierungsreihenfolge umstellen:
1. `isNaN` check
2. Sekunden-Range: `secs > 59` → Fehlermeldung
3. Gesamt-Minimum: `totalMs < 1000`
4. Gesamt-Maximum: `totalMs > 5_999_000` (konsistent mit Server-Clamp)

## Priority
Nice-to-have
