# BUG-FEAT1-UX-009: ShareSection Toggle-Button ohne Hover- und Fokus-State

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** A11y | UX
- **Gefunden von:** UX Reviewer
- **Status:** Fixed

## Problem

Der "Session teilen"-Toggle-Button in `ShareSection.tsx` (Zeilen 25–50) hat keinerlei visuelles Feedback bei Hover oder Tastatur-Fokus. Inline-Styles definieren nur den Ruhezustand. Es gibt weder `onMouseEnter`/`onMouseLeave`-Handler noch einen `:hover`-Stil, noch einen `onFocus`/`onBlur`-Handler.

Der globale CSS-Reset in `index.css` setzt `border: none; background: none` auf allen Buttons, definiert aber keinen `button:focus-visible`-Ersatz (Bug UX-002 adressiert das global). Dieser Button ist zusätzlich betroffen, da er in einer separaten Komponente lebt und von einem Fix in `LandingPage.tsx` allein nicht erfasst würde.

Konkret:
- **Hover:** Keine visuelle Reaktion – der Nutzer erhält kein Signal, dass der Button klickbar ist
- **Tastatur-Fokus:** Kein sichtbarer Fokusring. WCAG 2.1 SC 2.4.7 (Focus Visible) wird verletzt.

Das betrifft besonders die Moderatoren-Ansicht, die der primäre Arbeitsbereich des Moderators ist. Keyboard-only-Nutzer können nicht erkennen, ob der ShareSection-Button fokussiert ist.

## Steps to Reproduce
1. Öffne Moderatoren-Ansicht einer Session
2. Navigiere per Tab bis zum "Session teilen"-Button
3. Expected: Sichtbarer Fokusring (z.B. blauer Outline, 2px solid var(--color-accent))
4. Actual: Kein sichtbarer Fokus-Indikator

## Empfehlung
Entweder globalen `button:focus-visible`-Stil in `index.css` einführen (synchron mit Fix aus UX-002), oder lokal im Button-Inline-Style einen `onFocus`/`onBlur`-Handler ergänzen. Für Hover: `onMouseEnter/Leave` mit Hintergrundfarbe `var(--color-bg)` als subtile Unterscheidung zum Ruhezustand `var(--color-surface)`.

## Priority
Fix before release

## Fix (2026-03-28)
ShareSection-Toggle: Hover-State via isHovered-State (bg wechselt zu --color-bg). Focus-visible durch globalen button:focus-visible in index.css abgedeckt (UX-002).
