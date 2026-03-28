# BUG-FEAT1-UX-023: ShareSection Toggle-Button ohne aria-label – "Session teilen" als einziger Name reicht nicht

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

Der Toggle-Button in ShareSection hat `aria-expanded` korrekt gesetzt. Der sichtbare Text "Session teilen" ist der einzige zugängliche Name des Buttons.

Das Problem ist, dass Screen Reader den Button vorlesen als: "Session teilen, ausgeklappt, Schaltfläche" oder "Session teilen, eingeklappt, Schaltfläche" – je nach Browser/SR-Kombination. Das ist noch akzeptabel.

Was fehlt: Der Button hat kein `aria-controls`-Attribut (wurde in einem früheren Bug korrekt entfernt, da das Element immer im DOM ist). Aber das geringe Detailproblem ist der Chevron-Pfeil (▴/▾) als Unicode-Zeichen im `<span aria-hidden="true">`. Das ist korrekt implementiert.

Der eigentliche Bug: Der Button signalisiert mit `aria-expanded` den Zustand, aber es gibt keine `id` auf dem kontrollierten Panel. Ohne `aria-controls` fehlt die programmatische Verbindung zwischen Button und Panel vollständig – Screen Reader haben keine Möglichkeit, vom Button direkt zum zugehörigen Inhalt zu navigieren.

Hinweis: UX-007 hat `aria-controls` entfernt mit dem Argument "element is always in DOM". Das stimmt – aber das eigentliche Problem war ein fehlerhafter Wert, nicht das Attribut selbst. Wenn das Panel immer im DOM ist (hidden-Attribut entfernt es aus dem Accessibility-Tree), ist `aria-controls` mit einem gültigen Panel-id wieder sinnvoll und korrekt.

## Steps to Reproduce

1. Öffne ModeratorView mit einem Screen Reader (z.B. VoiceOver auf iOS)
2. Fokussiere den "Session teilen"-Button
3. Expected: Screen Reader vermittelt sowohl den Zustand (expanded/collapsed) als auch die Möglichkeit, direkt zum kontrollierten Inhalt zu navigieren
4. Actual: `aria-expanded` wird korrekt kommuniziert, aber ohne `aria-controls` fehlt die programmatische Verbindung zum Panel – Navigation vom Button zum Inhalt ist nur durch lineare Tab-Navigation möglich

## Empfehlung

`aria-controls="share-section-content"` auf den Toggle-Button zurücksetzen. Die `id="share-section-content"` ist auf dem Panel bereits vorhanden (ShareSection.tsx Zeile 57). Sicherstellen, dass das Panel bei `!isOpen` mit dem `hidden`-Attribut aus dem Accessibility-Tree entfernt wird – was bereits der Fall ist.

## Priority

Nice-to-have
