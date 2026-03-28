# FEAT-2: Timer

## Status
Aktueller Schritt: Dev

## Abhängigkeiten
- Benötigt: FEAT-1 (Session Management) – Timer läuft innerhalb einer Session

---

## 1. Feature Spec
*Ausgefüllt von: /requirements — 2026-03-27*

### Beschreibung
Der Moderator wählt eine Timebox-Dauer (Preset oder individuelle Eingabe) und startet
den Countdown. Alle Teilnehmer in der Session sehen denselben Timer in Echtzeit.
Der Timer durchläuft drei visuelle Zustände (running, warning, expired). Bei Ablauf
ertönt ein sanfter Sound bei allen Clients. Der Moderator kann den Timer jederzeit
pausieren, fortsetzen oder zurücksetzen.

### Definitionen
- **Timebox:** Eine festgelegte Zeitspanne für eine Workshop-Aktivität, definiert durch
  Moderator-Auswahl.
- **Timer-Zustand "running":** Timer läuft, verbleibende Zeit > 20% der Gesamtdauer.
- **Timer-Zustand "warning":** Timer läuft, verbleibende Zeit ≤ 20% der Gesamtdauer.
- **Timer-Zustand "expired":** Countdown hat 00:00 erreicht, Sound wurde abgespielt.
- **Preset:** Eine vordefinierte Timebox-Dauer (2, 5, 10, 15, 30 Minuten),
  per Klick auswählbar.
- **Echtzeit-Sync:** Alle verbundenen Clients einer Session sehen denselben
  Timer-State mit maximal ~1 Sekunde Versatz.

### User Stories
- Als Moderator möchte ich ein Preset (2, 5, 10, 15, 30 Min) per Klick auswählen,
  um ohne Tipp-Aufwand die häufigsten Timeboxen zu starten.
- Als Moderator möchte ich eine individuelle Zeit eingeben, um flexible
  Timeboxen für ungewöhnliche Dauern zu ermöglichen.
- Als Moderator möchte ich den Timer starten, pausieren und fortsetzen, um
  auf spontane Workshop-Situationen reagieren zu können.
- Als Moderator möchte ich den Timer zurücksetzen, um ihn auf die ursprünglich
  gewählte Dauer zurückzubringen und neu zu starten.
- Als Teilnehmer möchte ich den aktuellen Timer-Stand in Echtzeit sehen, um
  ohne eigene Uhr den Zeitdruck der Timebox zu spüren.
- Als Teilnehmer möchte ich durch einen Sound informiert werden wenn die Zeit
  abgelaufen ist, auch wenn ich nicht auf den Bildschirm schaue.

### Acceptance Criteria
- [ ] Die Moderatoren-Ansicht zeigt fünf Preset-Buttons: 2, 5, 10, 15, 30 Min
- [ ] Die Moderatoren-Ansicht enthält ein Eingabefeld für individuelle Zeiteingabe
      (Minuten und Sekunden, nur positive ganzzahlige Werte)
- [ ] Nach Auswahl einer Dauer (Preset oder individuell) wird die Zeit im Timer
      angezeigt, aber der Timer startet nicht automatisch
- [ ] Der Moderator kann den Timer starten; ab diesem Moment läuft der Countdown
- [ ] Der Moderator kann den laufenden Timer pausieren und wieder fortsetzen
- [ ] Der Moderator kann den Timer zurücksetzen auf die ursprünglich gewählte Dauer
- [ ] Bei ≤ 20% verbleibender Zeit wechselt der Timer-Hintergrund von
      `--timer-bg-running` zu `--timer-bg-warning` und die Schriftfarbe
      zu `--timer-text-warning`
- [ ] Bei 00:00 wechselt der Timer in den Zustand "expired"
      (`--timer-bg-expired` / `--timer-text-expired`)
- [ ] Bei Ablauf (00:00) wird für alle verbundenen Clients ein sanfter Sound abgespielt
- [ ] Alle Teilnehmer einer Session sehen denselben Timer-Stand mit max. ~1 Sek. Versatz
- [ ] Teilnehmer sehen keine Steuerungselemente (keine Buttons für Start/Pause/Reset)
- [ ] Der Timer zeigt die verbleibende Zeit im Format `MM:SS`

### Edge Cases
- **Tab war im Hintergrund (Browser-Throttling):** Nach Rückkehr in den Vordergrund
  synchronisiert der Client den aktuellen Stand vom Server – kein lokales Timer-Drift
- **Moderator setzt Timer zurück während Teilnehmer zuschauen:** Alle Clients
  synchronisieren sofort auf die neue Ausgangszeit
- **Teilnehmer tritt Session bei während Timer läuft:** Erhält sofort den
  aktuellen Stand, kein Warten auf nächsten Tick
- **Individuelle Zeiteingabe = 0:** Nicht erlaubt; Eingabe wird nicht akzeptiert,
  Fehlermeldung "Mindestens 1 Sekunde"
- **Individuelle Zeiteingabe > 99 Minuten:** Nicht erlaubt; maximale Dauer ist 99:59
- **Sound kann nicht abgespielt werden (Browser-Policy):** Timer läuft korrekt weiter,
  visueller expired-Zustand wird trotzdem angezeigt; kein Fehler für den Nutzer
- **Netzwerkunterbrechung während laufendem Timer:** Timer läuft clientseitig weiter
  (lokal); nach Reconnect erfolgt Synchronisation mit Server-Stand

### Nicht im Scope
- Mehrere gleichzeitige Timer in einer Session
- Sequenz-Timer (mehrere Timeboxen hintereinander)
- Eigene Sound-Auswahl durch den Moderator
- Timer-Verlauf oder Historie

---

## 2. IA/UX Entscheidungen
*Ausgefüllt von: /ia-ux — 2026-03-27*

### Einbettung im Produkt
Zwei eigenständige Screens auf derselben Route – Moderatoren-Ansicht und Teilnehmer-Ansicht
werden anhand des `?mod=<token>`-Parameters unterschieden.
Route: `/session/:id` (Teilnehmer) und `/session/:id?mod=<token>` (Moderator)

### Einstiegspunkte
- Moderator: Redirect nach Session-Erstellung von `/`
- Moderator: Direktaufruf der gebookmarkten Moderatoren-URL
- Teilnehmer: Klick auf geteilten Link im Meeting-Chat
- Teilnehmer: Redirect nach Nummer-Eingabe auf `/`

### User Flow

```
Moderatoren-Ansicht
    ↓ [Klick auf Preset-Button, z.B. "10 Min"]
Timer zeigt 10:00, läuft noch nicht
    ↓ [Klick: Start]
Countdown läuft – alle Teilnehmer synchronisiert
    ↓ [bei 2:00 = 20% von 10 Min]
Visueller Zustandswechsel: warning (Hintergrund + Textfarbe)
    ↓ [bei 00:00]
Visueller Zustandswechsel: expired – Sound für alle Clients
    ↓ [Klick: Reset]
Timer zeigt wieder 10:00, wartet auf Start

---

Moderator: Pause-Flow
Timer läuft
    ↓ [Klick: Pause]
Countdown stoppt, "Resume"-Button erscheint
    ↓ [Klick: Resume]
Countdown läuft weiter ab dem Pausier-Zeitpunkt

---

Teilnehmer-Ansicht
    ↓ [Seite geladen, Timer läuft bereits]
Sofort aktueller Stand sichtbar (kein Warten)
    ↓
Nur Timer-Anzeige, keine Interaktion möglich

---

Verbindungsstatus
    ↓ [Netzwerkunterbrechung]
Diskreter Verbindungsindikator sichtbar (nicht störend)
    ↓ [Reconnect]
Indikator verschwindet, State wird synchronisiert
```

### Interaktionsmuster
- **Primärmuster (Moderator):** Dashboard mit direkten Aktions-Buttons (kein Wizard,
  kein Formular-Submit – jede Aktion wirkt sofort)
- **Primärmuster (Teilnehmer):** Reine Informationsanzeige ohne Interaktion
- **Fehler-Handling:** Ungültige Custom-Zeit → Inline-Fehler unter dem Eingabefeld,
  kein Blockieren anderer Aktionen
- **Leerer Zustand:** Timer startet immer mit 00:00 und wartet auf Preset-Auswahl.
  Preset-Buttons sind der primäre Einstieg.
- **Ladeverhalten:** Kein Spinner – Timer-State wird instant nach WebSocket-Connect angezeigt.
  Bei langsamem Connect: dezenter Verbindungsindikator.
- **Share-Bereich:** Standardmäßig collapsed; beim ersten Öffnen der Session (direkt nach
  Erstellung) einmalig aufgeklappt, danach collapsed bis manuell geöffnet.

### Konzeptionelle Komponentenstruktur

**Moderatoren-Ansicht:**
```
ModeratorView
├── TimerDisplay [Zustandsabhängig: running / warning / expired]
│   ├── CountdownLabel (MM:SS, tabular numbers, groß)
│   └── ConnectionIndicator (dezent, nur bei Verbindungsproblem)
├── ControlSection
│   ├── PresetButtons (2 | 5 | 10 | 15 | 30 Min)
│   ├── CustomTimeInput (Minuten-Feld + Sekunden-Feld + Fehlermeldung)
│   └── ActionButtons
│       ├── StartButton (sichtbar wenn Timer gestoppt/pausiert)
│       ├── PauseButton (sichtbar wenn Timer läuft)
│       └── ResetButton (immer sichtbar wenn Dauer gewählt)
└── ShareSection (collapsed by default)
    ├── ToggleTrigger "Session teilen"
    ├── SessionNumberDisplay (4-stellig, groß, lesbar)
    ├── CopyButton: Teilnehmer-URL + Bestätigung "Kopiert!"
    └── CopyButton: Moderatoren-URL + Bestätigung "Kopiert!"
```

**Teilnehmer-Ansicht:**
```
ParticipantView
├── TimerDisplay [Zustandsabhängig: running / warning / expired]
│   ├── CountdownLabel (MM:SS, tabular numbers, groß)
│   └── ConnectionIndicator (dezent, nur bei Verbindungsproblem)
└── SessionBadge (Session-Nummer, klein, dezent)
```

### Barrierefreiheit (A11y)
- Keyboard-Navigation (Moderator): Tab durch Presets → Custom-Input → Start/Pause/Reset →
  Share-Toggle; Enter/Space aktiviert Buttons
- Screen Reader: Timer-Anzeige als `aria-live="polite"` (sekündliche Updates);
  bei expired-Zustand `aria-live="assertive"` für sofortige Ankündigung
- Farbkontrast: Alle drei Timer-Zustände (running/warning/expired) erfüllen ≥4.5:1
  mit den definierten Farb-Tokens aus dem PRD
- Sound ist kein alleiniger Alert: visueller expired-Zustand immer vorhanden
  (Sound-only wäre WCAG-Verstoß)
- Tabular numbers: CountdownLabel verwendet `font-variant-numeric: tabular-nums`
  (kein Layout-Shift durch wechselnde Ziffernbreiten)

### Mobile-Verhalten
- TimerDisplay füllt den verfügbaren Viewport-Bereich (groß und lesbar auch aus Distanz)
- Alle Buttons ≥44px Höhe (Touch-Target)
- PresetButtons: horizontal scrollbar auf sehr kleinen Screens (375px) oder 2-Zeilen-Wrap
- CustomTimeInput: `inputmode="numeric"` für Ziffern-Keyboard
- ShareSection bleibt ausklappbar auch auf Mobile; Teilnehmer-URL und Token gut kopierbar

---

## 3. Technisches Design
*Ausgefüllt von: /solution-architect — 2026-03-27*

### Component-Struktur

```
SessionPage                     – Routing-Container (aus FEAT-1)
├── ModeratorView
│   ├── TimerDisplay            – zustandsabhängige Darstellung (running/warning/expired)
│   │   └── CountdownLabel      – MM:SS mit tabular-nums
│   ├── ConnectionIndicator     – dezent, nur bei Verbindungsproblem sichtbar
│   ├── PresetButtons           – 5 Buttons: 2 | 5 | 10 | 15 | 30 Min
│   ├── CustomTimeInput         – Min-Feld + Sek-Feld + Inline-ErrorMessage
│   ├── TimerControls           – Start / Pause / Resume / Reset (kontextabhängig)
│   └── ShareSection            – collapsed by default
│       ├── ToggleTrigger
│       ├── SessionNumberDisplay
│       └── CopyButton (×2: Teilnehmer-URL + Moderatoren-URL)
└── ParticipantView
    ├── TimerDisplay            – identische Komponente wie oben (read-only)
    ├── ConnectionIndicator     – identisch
    └── SessionBadge            – zeigt Session-Nummer dezent

Gemeinsam genutzt:
- TimerDisplay        – von Moderator + Participant View identisch verwendet
- ConnectionIndicator – von beiden Views identisch verwendet
- CopyButton          – von ShareSection und ggf. SessionBadge verwendet
```

### Daten-Model

**Timer-Zustand im PartyKit Durable Object:**
- `status`: 'idle' | 'running' | 'paused' | 'expired'
- `totalDurationMs`: Gesamtdauer der aktuellen Timebox (Millisekunden)
- `remainingMs`: Restzeit zum Zeitpunkt des letzten Pause/Reset/Start-Events
- `startedAt`: Timestamp wann Timer zuletzt gestartet/fortgesetzt wurde (null wenn nicht laufend)
- `lastActivityAt`: Timestamp des letzten Timer-Starts (für 3h-Alarm)

**Berechnete Werte (Client-seitig, nicht gespeichert):**
- `currentRemainingMs` = `remainingMs - (Date.now() - startedAt)` wenn status 'running'
- `isWarning` = `currentRemainingMs ≤ totalDurationMs × 0.2`
- `timerLabel` = MM:SS formatiert aus `currentRemainingMs`

*Kein Server-Tick – der Server speichert Snapshots, der Client interpoliert.*

Gespeichert in: PartyKit Durable Object (flüchtiger In-Memory-State, 3h TTL)

### API / Daten-Fluss

**WebSocket Message Types – vollständig:**

Moderator → Server (nur wenn Token übereinstimmt):
- `SET_DURATION` `{ durationMs }` – Dauer setzen (Preset oder Custom)
- `START` – Timer starten (setzt `startedAt = now`, Status → 'running')
- `PAUSE` – Timer pausieren (berechnet + speichert `remainingMs`, löscht `startedAt`)
- `RESUME` – weiter laufen (setzt neuen `startedAt`, Status → 'running')
- `RESET` – zurücksetzen auf `totalDurationMs`, Status → 'idle'

Server → alle Clients (Broadcast nach jeder Zustandsänderung):
- `STATE_UPDATE` `{ status, totalDurationMs, remainingMs, startedAt }` – vollständiger State

Server → neu verbundener Client (on connect):
- Sofortiger `STATE_UPDATE` mit aktuellem Zustand (kein Warten auf nächste Änderung)

Server → alle Clients (bei Alarm-Auslösung nach 3h):
- `SESSION_EXPIRED` – Clients zeigen "Session abgelaufen"-Meldung, Reconnect nicht möglich

**Sound-Trigger:**
- Client-seitig: wenn Status von 'running' auf 'expired' wechselt → Audio-API abspielen
- Kein Server-seitiger Sound – jeder Client spielt lokal ab (Browser-Policy-konform)

### Tech-Entscheidungen

- **Kein Server-Tick:** Server speichert nur Snapshots (`startedAt` + `remainingMs`).
  Clients berechnen aktuelle Restzeit lokal mit `requestAnimationFrame` oder `setInterval(1000)`.
  Vorteile: kein kontinuierlicher WebSocket-Traffic, kein DO-Overhead, automatisch
  sync-resistent (jeder Client rechnet unabhängig aber vom gleichen Server-Snapshot)
- **Web Audio API für Sound:** Kein externes Audio-Package nötig; `AudioContext` ist
  nativ im Browser verfügbar; erlaubt programmatisch erzeugten sanften Ton (kein
  Audio-File-Hosting nötig)
- **`useTimerSession` Custom Hook:** Kapselt WebSocket-Connect (via `partysocket`),
  empfangene State-Updates und das Senden von Kommandos – von Moderator- und
  Teilnehmer-View gleichermaßen nutzbar

### Security-Anforderungen

- **Authentifizierung:** Moderator-Kommandos werden Server-seitig nur ausgeführt,
  wenn der mitgesendete Token mit dem gespeicherten `modToken` übereinstimmt
- **Autorisierung:** Teilnehmer können keine Kommandos senden (Server ignoriert
  Nachrichten ohne gültigen Token stillschweigend)
- **Input-Validierung:**
  - `durationMs` muss > 0 und ≤ 5.999.000 ms (99:59) sein
  - Unbekannte Message-Types werden Server-seitig ignoriert
- **OWASP-relevante Punkte:**
  - Kein XSS-Risiko: Timer-Werte sind Numbers, keine User-generierten Strings im DOM
  - DoS-Schutz: PartyKit / Cloudflare übernimmt Rate-Limiting auf Infrastrukturebene

### Dependencies

Keine neuen Dependencies für FEAT-2 (FEAT-1 installiert bereits alle nötigen Pakete).
`partysocket` (Client) und `partykit` (Server-CLI) sind bereits installiert.

Optional für Sound:
- Keine externen Packages – Web Audio API ist Browser-nativ

### Test-Setup

- **Unit Tests (Vitest):**
  - `currentRemainingMs`-Berechnung aus Server-Snapshot (verschiedene Zeitpunkte)
  - Warning-Schwellwert: 20% wird korrekt erkannt (Grenzwerte testen)
  - MM:SS-Formatierung: `0` → `00:00`, `61000` → `01:01`, `5999000` → `99:59`
  - TimerDisplay: rendert korrekte CSS-Klassen für running / warning / expired
  - CustomTimeInput: Validierung lehnt 0 und >99:59 ab, akzeptiert Grenzwerte

- **Integration Tests:**
  - PartyKit-Server: START-Kommando von Moderator ändert Status auf 'running' und
    broadcastet STATE_UPDATE an alle Clients
  - PartyKit-Server: PAUSE speichert korrekte `remainingMs`
  - PartyKit-Server: Kommandos ohne Token werden ignoriert (kein State-Change)
  - PartyKit-Server: Neu joinender Client erhält sofort aktuellen State

- **E2E Tests (Playwright):**
  - Moderator wählt 5-Min-Preset → klickt Start → Teilnehmer-Tab zeigt laufenden Timer
  - Timer wechselt in Warning-State bei korrekter Zeit (≤20% Rest)
  - Timer läuft auf 00:00 → expired-State in beiden Tabs sichtbar
  - Moderator pausiert Timer → Teilnehmer sieht eingefrorene Zeit
  - Reset stellt ursprüngliche Dauer wieder her (beide Tabs)

---

## 4. Implementierung
*Ausgefüllt von: /developer — 2026-03-28*

### Implementierte Dateien
- `projekt/src/party/timer.ts` – Timer-Kommandos (SET_DURATION, START, PAUSE, RESUME, RESET), 3h-Alarm
- `projekt/src/hooks/useTimerSession.ts` – rAF-basiertes displayRemainingMs, isWarning, Sound-Trigger
- `projekt/src/components/TimerDisplay.tsx` – Zustands-Farben, aria-live, tabular-nums
- `projekt/src/components/PresetButtons.tsx` – 5 Presets mit aktivem Zustand
- `projekt/src/components/CustomTimeInput.tsx` – Min/Sek-Felder, Validierung, Inline-Fehler
- `projekt/src/components/TimerControls.tsx` – Kontextabhängige Buttons
- `projekt/src/components/ConnectionIndicator.tsx` – Dezenter Verbindungsstatus
- `projekt/src/components/ModeratorView.tsx` – Vollständige Steuerungsansicht
- `projekt/src/components/ParticipantView.tsx` – Read-only Timer-Ansicht

### Installierte Dependencies
- Keine neuen (Web Audio API browser-nativ)

### Offene Punkte / Tech-Debt
- Keine

---

## 5. QA Ergebnisse
*Ausgefüllt von: /qa-engineer — 2026-03-28*

### Acceptance Criteria Status
- [x] Fünf Preset-Buttons ✅
- [x] Individuelle Zeiteingabe ✅
- [x] Timer startet nicht automatisch ✅
- [x] Moderator kann starten ✅
- [x] Moderator kann pausieren/fortsetzen ✅
- [x] Moderator kann zurücksetzen ✅
- [ ] Warning bei ≤ 20% – falsch bei Pause ❌ → BUG-FEAT2-QA-003
- [ ] Expired-Zustand bei 00:00 – Server setzt nie 'expired' ❌ → BUG-FEAT2-QA-002 (Critical)
- [ ] Sound für alle Clients – Race Condition ❌ → BUG-FEAT2-QA-001
- [x] Echtzeit-Sync – Architektur korrekt ✅ (beeinträchtigt durch QA-002)
- [x] Teilnehmer sehen keine Steuerungselemente ✅
- [x] MM:SS-Format ✅

### Security-Check
- Mod-Kommandos nur nach Token-Validierung ausgeführt ✅
- Server-seitiger durationMs-Clamp implementiert ✅
- START ohne gesetzte Dauer möglich → BUG-FEAT2-QA-006

### A11y-Check
- `aria-live="polite"` auf Timer – Screenreader-Problem → BUG-FEAT2-UX-002
- `aria-invalid` auf falschen Feldern → BUG-FEAT2-UX-003
- `aria-controls` zeigt ins Leere → BUG-FEAT2-UX-006

### Offene Bugs
- ~~BUG-FEAT2-QA-001~~ – Sound-Trigger Race Condition (High) → **Fixed**
- ~~BUG-FEAT2-QA-002~~ – Server setzt Status nie auf 'expired' (Critical) → **Fixed**
- BUG-FEAT2-QA-003 – isWarning true auch bei pausiertem Timer (Medium)
- BUG-FEAT2-QA-004 – CustomTimeInput Dead Code (Medium)
- BUG-FEAT2-QA-005 – ArrayBuffer crasht JSON.parse (Medium)
- BUG-FEAT2-QA-006 – START ohne totalDurationMs-Check (Medium)
- BUG-FEAT2-QA-007 – AudioContext nicht geschlossen (Low)
- BUG-FEAT2-QA-008 – ShareSection öffnet sich bei jedem Reload (Low)
- ~~BUG-FEAT2-UX-001~~ – Paused-Zustand visuell = Running (High) → **Fixed**
- ~~BUG-FEAT2-UX-002~~ – aria-live auf tickendem Timer (High) → **Fixed**
- BUG-FEAT2-UX-003 – Beide Felder als aria-invalid (Medium)
- BUG-FEAT2-UX-004 – Idle zeigt "00:00" (Medium)
- BUG-FEAT2-UX-005 – Deaktivierte Presets ohne Erklärung (Low)
- BUG-FEAT2-UX-006 – aria-controls zeigt ins Leere (Medium)
- BUG-FEAT2-UX-007 – Unicode ⎘ statt SVG-Icon (Low)
- BUG-FEAT2-UX-008 – Warning-State Kontrast ~4.6:1 (Medium)
- BUG-FEAT2-UX-009 – Expired + Starten-Button gleichzeitig (Medium)

### Summary
- ✅ 7 Acceptance Criteria passed
- ✅ 1 Critical + 3 High Bugs Fixed
- ❌ 13 Bugs remaining (0 Critical, 0 High, 8 Medium, 5 Low)

### Production-Ready
⏳ Pending re-QA – Critical + High fixed, Medium/Low open
