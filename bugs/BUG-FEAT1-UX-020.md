# BUG-FEAT1-UX-020: ShareSection – hidden-Attribut und display:none redundant gesetzt

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** A11y | Konsistenz
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Open

## Beschreibung

In ShareSection.tsx (Zeilen 56–66) wird das Expand/Collapse-Panel mit zwei redundanten Mechanismen versteckt:

```tsx
<div
  id="share-section-content"
  hidden={!isOpen}
  style={{
    display: isOpen ? 'flex' : 'none',
    ...
  }}
>
```

Das HTML-Attribut `hidden` setzt automatisch `display: none` im Browser. Der zusätzliche `display: isOpen ? 'flex' : 'none'` im style-Objekt ist damit wirkungslos – wenn `hidden` gesetzt ist, wird der Inline-Style vom Browser-Default überschrieben.

Das ist kein funktionaler Bug, aber ein konzeptionelles Problem: Der style-Wert `display: 'flex'` im sichtbaren Zustand (`!hidden`) funktioniert korrekt, aber `display: 'none'` im hidden-Zustand ist redundant und irreführend für jeden der den Code liest.

Kritischer: Wenn in Zukunft ein Stylesheet `.share-section-content { display: flex !important }` oder ähnliches hinzugefügt wird, könnte das `hidden`-Attribut durch den style-Override unbeabsichtigt umgangen werden – oder umgekehrt der style durch das Attribut nicht greifen. Die doppelte Logik erzeugt unvorhersehbares Verhalten bei CSS-Erweiterungen.

Aus A11y-Sicht ist `hidden` der korrektere Mechanismus, da er das Element auch aus dem Accessibility-Tree entfernt – das ist gewünscht. Die redundante display-Logik sollte bereinigt werden.

## Steps to Reproduce

Nicht direkt nutzerseitig reproduzierbar. Sichtbar bei Inspektion des DOM: Element hat `hidden`-Attribut und `style="display: none"` gleichzeitig wenn zugeklappt; `style="display: flex"` und kein `hidden` wenn aufgeklappt.

Expected: Nur `hidden`-Attribut für Sichtbarkeitssteuerung; `display: flex` als statischen Style wenn sichtbar
Actual: Redundante Steuerung über beide Mechanismen

## Empfehlung

Den `display`-Wert aus der Bedingung herausnehmen und als statischen Style setzen, da `hidden` die Ausblendung vollständig übernimmt:

```tsx
style={{
  display: 'flex',  // immer flex wenn sichtbar; hidden-Attribut übernimmt das Verstecken
  ...
}}
```

## Priority

Nice-to-have
