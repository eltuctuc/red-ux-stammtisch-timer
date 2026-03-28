# BUG-FEAT2-UX-006: ShareSection – kein Fokus-Management beim Aufklappen, kein prefers-reduced-motion

- **Feature:** FEAT-2 – Timer
- **Severity:** Medium
- **Bereich:** A11y
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Open

## Beschreibung
`ShareSection.tsx` implementiert eine Accordion-Komponente (Toggle-Button + expandierbarer
Bereich). Zwei A11y-Probleme:

**Problem 1 – Fokus-Management:**
Wenn Mia die ShareSection per Tastatur öffnet (Tab zum Toggle-Button, Enter/Space),
wird der Bereich aufgeklappt – aber der Fokus bleibt auf dem Toggle-Button. Die neu
erschienenen Inhalte (Session-Nummer, Copy-Buttons) sind per Tastatur zwar durch
weiteres Tabben erreichbar, aber der Fokus springt nicht automatisch zum ersten
interaktiven Element. Das ist kein kritischer Fehler, aber suboptimal für reine
Keyboard-Nutzer.

**Problem 2 – Kein Animations-Fallback:**
Das Aufklappen/Zuklappen des Accordion-Bereichs passiert durch konditionelles Rendering
(`{isOpen && ...}`), also ohne Animation. Das ist technisch kein Problem – aber
in der Spec ist ein "ausgeklappter" Zustand beim ersten Session-Load beschrieben
(`initiallyOpen`). Kein `prefers-reduced-motion`-Check ist nötig wenn keine Animation
stattfindet, aber falls zukünftig eine Slide-Animation ergänzt wird, muss dieser
Check vorhanden sein.

**Problem 3 – aria-controls Referenz funktioniert nur bei geöffnetem Zustand:**
`aria-controls="share-section-content"` referenziert eine `id` die nur im DOM ist,
wenn `isOpen === true`. Bei geschlossener Section ist das referenzierte Element nicht
im DOM – `aria-controls` zeigt damit ins Leere. Das ist ein ARIA-Fehler: das referenzierte
Element sollte immer im DOM sein (ggf. mit `hidden`-Attribut oder `display: none`).

## Betroffene Datei(en)
- `projekt/src/components/ShareSection.tsx`

## Expected (aus Nutzerperspektive)
Beim Aufklappen der ShareSection per Tastatur springt der Fokus auf den ersten
sinnvollen Inhalt (Session-Nummer oder erster Copy-Button).
`aria-controls` verweist auf ein stets im DOM vorhandenes Element.

## Actual
Fokus verbleibt auf dem Toggle-Button. Das `aria-controls`-Ziel existiert nur wenn
der Bereich geöffnet ist.

## Fix-Hinweis
Den Inhaltsbereich immer im DOM halten, mit `hidden`-Attribut oder `visibility: hidden`
wenn geschlossen – statt conditionalem Rendering. Alternativ `aria-controls` entfernen
wenn das Element nicht permanent im DOM ist. Für den Fokus: nach dem Öffnen per
`useEffect` + `ref.focus()` den ersten Copy-Button fokussieren.

## Priority
Fix before release
