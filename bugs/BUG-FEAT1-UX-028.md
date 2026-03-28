# BUG-FEAT1-UX-028: ParticipantView Fehler-Screens ohne h1 – fehlendes Heading-Muster auf allen Fehler-Screens

- **Feature:** FEAT-1 – Session Management
- **Severity:** Low
- **Bereich:** A11y | Konsistenz
- **Gefunden von:** UX Reviewer
- **Status:** Open

## Problem

BUG-FEAT1-UX-027 hat das fehlende `<h1>` auf dem `sessionExpired`-Screen in ModeratorView identifiziert. Der gleiche strukturelle Mangel besteht in zwei weiteren Fehler-Screens, die UX-027 nicht erfasst hat:

**1. ParticipantView – sessionExpired-Screen (Zeilen 37–39)**
```tsx
<p role="alert" style={{ fontSize: '18px', fontWeight: 500 }}>
  Session abgelaufen.
</p>
```
Identische Struktur wie der ModeratorView-Fall aus UX-027: kein `<h1>`, nur ein `<p>` mit `role="alert"`.

**2. ParticipantView – connectionError-Screen (Zeilen 80–85)**
```tsx
<p
  role="alert"
  style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)' }}
>
  {title}
</p>
```
Hier tragen die Fehlertexte "Session nicht gefunden." und "Verbindungsfehler." ebenfalls keine Heading-Semantik.

Alle drei betroffenen Screens (ModeratorView sessionExpired, ParticipantView sessionExpired, ParticipantView connectionError) sind vollständige Ersatz-Screens, die die gesamte Hauptansicht ersetzen. Sie funktionieren wie eigenständige Seiten und brauchen deshalb eine Heading-Hierarchie.

Für Screen-Reader-Nutzer bedeutet das:
- Der Heading-Rotor (VoiceOver, NVDA) findet keine Überschrift auf diesen Screens
- Eine Navigation per Heading (H-Taste in NVDA) bleibt stumm
- Es besteht keine programmatische Seitenstruktur – der User landet "im Nichts"

Das ist außerdem eine direkte Inkonsistenz: LandingPage hat ein korrektes `<h1>` ("Workshop Timer"). Die Fehler-Screens der App haben keines.

## Steps to Reproduce

1. Öffne als Teilnehmer eine abgelaufene Session-URL
2. ParticipantView rendert den sessionExpired-Screen
3. Aktiviere VoiceOver / NVDA und navigiere per Heading-Rotor
4. Expected: "Session abgelaufen" als `<h1>` navigierbar
5. Actual: Keine Überschrift auf dem Screen – der Heading-Rotor meldet keine Ergebnisse

Alternativ: Öffne eine nicht existierende Session-URL als Teilnehmer.
connectionError-Screen erscheint ohne Heading-Struktur.

## Empfehlung

Auf allen drei betroffenen Screens `<h1>` statt `<p>` für den Haupt-Fehlertitel verwenden und `role="alert"` auf den erklärenden Folgetext verschieben:

```tsx
// Vorher:
<p role="alert" style={{ fontSize: '18px', fontWeight: 500 }}>Session abgelaufen.</p>
<p style={{ color: 'var(--color-text-secondary)' }}>Diese Session war 3 Stunden inaktiv...</p>

// Nachher:
<h1 style={{ fontSize: '18px', fontWeight: 500 }}>Session abgelaufen</h1>
<p role="alert" style={{ color: 'var(--color-text-secondary)' }}>
  Diese Session war 3 Stunden inaktiv und wurde beendet.
</p>
```

Dieses Muster auf alle drei Fehler-Screens anwenden und dabei UX-027 (ModeratorView sessionExpired) koordiniert mitfixen, um konsistente Semantik in der gesamten App sicherzustellen.

## Priority

Nice-to-have
