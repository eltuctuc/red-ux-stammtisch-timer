# FEAT-1: Session Management

## Status
Aktueller Schritt: Done

## Abhängigkeiten
- Benötigt: Keine

---

## 1. Feature Spec
*Ausgefüllt von: /requirements — 2026-03-27*

### Beschreibung
Die Haupt-URL bietet zwei Einstiegspunkte: "Neue Session starten" (für neue Workshops)
und "Bestehende Session fortsetzen" (für Reconnect nach Tab-Schließen). Bei neuer Session
erhält der Moderator eine Moderatoren-URL (mit Secret-Token) und eine Teilnehmer-URL.
Teilnehmer gelangen über die direkte Teilnehmer-URL oder durch manuelle Eingabe der
Session-Nummer auf der Haupt-URL in die Session. Sessions verfallen nach 3 Stunden
ohne neuen Timer-Start.

### Definitionen
- **Session:** Ein temporäres, geteiltes Timer-Environment mit eindeutiger Session-Nummer,
  erstellt durch einen Moderator, gültig bis 3 Stunden nach dem letzten Timer-Start.
- **Session-Nummer:** Eine 4-stellige numerische Kennung, die Teilnehmer zur manuellen
  Eingabe verwenden.
- **Moderatoren-URL:** Die vollständige URL inklusive Secret-Token (`?mod=<token>`),
  die exklusive Steuerrechte gewährt. Wer diese URL kennt, ist Moderator.
- **Teilnehmer-URL:** URL mit nur der Session-Nummer (`/session/<nummer>`),
  gewährt read-only Zugang zum Timer.
- **Secret-Token:** Ein zufällig generierter alphanumerischer String im URL-Parameter,
  der den Moderator gegenüber dem Server identifiziert.
- **Inaktivität:** Kein neuer Timer-Start durch den Moderator innerhalb von 3 Stunden.

### User Stories
- Als Moderator möchte ich auf der Haupt-URL aktiv eine neue Session starten,
  um einen neuen Workshop-Tag zu beginnen.
- Als Moderator möchte ich auf der Haupt-URL eine bestehende Session fortsetzen,
  um nach einem Tab-Schließen wieder einzusteigen ohne die Moderatoren-URL geöffnet zu haben.
- Als Moderator möchte ich meine Moderatoren-URL per Copy-Button kopieren, um sie
  als Bookmark zu speichern und die Session nach einem Tab-Schließen wieder aufzunehmen.
- Als Moderator möchte ich die Teilnehmer-URL per Copy-Button kopieren, um sie
  schnell im Meeting-Chat zu teilen.
- Als Teilnehmer möchte ich einer Session über einen geteilten Link beitreten, um
  den Timer des Moderators in Echtzeit zu sehen.
- Als Teilnehmer möchte ich auf der Haupt-URL eine Session-Nummer manuell eingeben,
  um auch ohne direkten Link beizutreten.
- Als Moderator möchte ich meine Session per Moderatoren-URL jederzeit wieder
  aufnehmen können, damit ein versehentliches Tab-Schließen nichts kaputt macht.

### Acceptance Criteria
- [ ] Die Haupt-URL zeigt zwei Aktionen: "Neue Session starten" (Button) und
      "Bestehende Session fortsetzen" (Eingabefeld für Moderatoren-URL oder Token)
- [ ] Klick auf "Neue Session starten" erstellt eine Session und öffnet die Moderatoren-Ansicht
- [ ] Eingabe einer gültigen Moderatoren-URL (oder des Secret-Tokens) unter "Bestehende Session
      fortsetzen" öffnet die Moderatoren-Ansicht der laufenden Session
- [ ] Die Session-Nummer ist genau 4 Ziffern lang und wird zufällig generiert
- [ ] Die Moderatoren-URL enthält einen Secret-Token als URL-Parameter (`?mod=<token>`)
- [ ] Die Moderatoren-URL und Teilnehmer-URL sind jeweils per Copy-Button kopierbar;
      nach dem Kopieren erscheint eine kurze Bestätigung ("Kopiert!")
- [ ] Die Teilnehmer-URL hat das Format `/session/<nummer>` ohne Token
- [ ] Der Aufruf der Moderatoren-URL mit gültigem Token zeigt die Steuerungsansicht
- [ ] Der Aufruf der Teilnehmer-URL zeigt die read-only Timer-Ansicht
- [ ] Auf der Haupt-URL gibt es ein Eingabefeld für Session-Nummern; bei Eingabe
      einer gültigen Nummer navigiert die App zur Teilnehmer-Ansicht
- [ ] Bei Eingabe einer nicht existierenden oder abgelaufenen Session-Nummer wird
      eine verständliche Fehlermeldung angezeigt ("Session nicht gefunden")
- [ ] Eine Session verfällt serverseitig nach 3 Stunden ohne neuen Timer-Start

### Edge Cases
- **Ungültige Session-Nummer (Teilnehmer-Flow):** Fehlermeldung "Session nicht gefunden",
  Eingabefeld bleibt aktiv für erneute Eingabe
- **Ungültiger Token beim Reconnect-Flow:** Fehlermeldung "Session nicht gefunden oder
  abgelaufen", Eingabefeld bleibt aktiv
- **Abgelaufene Session-Nummer eingegeben:** Gleiche Fehlermeldung wie "nicht gefunden" –
  keine technischen Details an den Nutzer
- **Moderatoren-URL wird von Teilnehmer aufgerufen:** Vollzugriff gewährt –
  Sicherheit durch Geheimhaltung der URL (security by obscurity, bewusste Entscheidung)
- **Zwei Tabs mit derselben Moderatoren-URL geöffnet:** Beide zeigen Steuerungsansicht;
  letzter Befehl gewinnt (last-write-wins), kein Konflikt-Handling nötig
- **Netzwerkunterbrechung:** App zeigt Verbindungsstatus; nach Reconnect wird
  aktueller Timer-State synchronisiert
- **4-stellige Nummer bereits vergeben:** Server generiert erneut bis eine
  freie Nummer gefunden ist (max. 9999 gleichzeitige Sessions)

### Nicht im Scope
- Login, Registrierung oder Nutzerverwaltung
- Moderator-Passwort oder weitere Authentifizierungsebenen
- Liste eigener vergangener Sessions
- Session-Verlängerung oder manuelles Beenden

---

## 2. IA/UX Entscheidungen
*Ausgefüllt von: /ia-ux — 2026-03-27*

### Einbettung im Produkt
Landing Page: eigener Screen, kein Navigation-Menü nötig.
Route: `/`

### Einstiegspunkte
- Direktaufruf der App-URL (Bookmark des Moderators)
- Direktaufruf der Moderatoren-URL → überspringt Landing Page, öffnet Moderatoren-Ansicht
- Direktaufruf der Teilnehmer-URL → überspringt Landing Page, öffnet Teilnehmer-Ansicht

### User Flow

```
Landing Page (/)
    ↓ [Klick: "Neue Session starten"]
Session wird erstellt (Server)
    ↓
Redirect → /session/:id?mod=<token>  (Moderatoren-Ansicht)
    ↓
Moderator sieht Share-Bereich (ausgeklappt bei erstem Laden der Session)
Kopiert Teilnehmer-URL in Meeting-Chat

---

Landing Page (/)
    ↓ [Eingabe: 4-stellige Nummer → Teilnehmer-Flow]
Validierung (Nummer existiert und ist aktiv?)
    ↓ (gültig)
Redirect → /session/:id  (Teilnehmer-Ansicht)
    ↓ (ungültig)
Inline-Fehler unter dem Eingabefeld: "Session nicht gefunden"
Eingabefeld bleibt aktiv

---

Landing Page (/)
    ↓ [Eingabe: Moderatoren-Token oder vollständige Moderatoren-URL → Reconnect-Flow]
Validierung (Token gültig und Session aktiv?)
    ↓ (gültig)
Redirect → /session/:id?mod=<token>  (Moderatoren-Ansicht)
    ↓ (ungültig/abgelaufen)
Inline-Fehler: "Session nicht gefunden oder abgelaufen"
```

### Interaktionsmuster
- **Primärmuster:** Single-Screen mit primärem CTA + smart Input (kein Formular-Submit-Pattern)
- **Smart Input:** Erkennt automatisch den Typ der Eingabe:
  - 4 Ziffern → Teilnehmer-Flow
  - Token-String oder vollständige URL → Moderator-Reconnect-Flow
- **Fehler-Handling:** Inline unterhalb des Eingabefelds, kein Alert, kein Page-Reload
- **Leerer Zustand:** Haupt-URL ist immer der leere Zustand – kein Empty-State nötig
- **Ladeverhalten:** "Neue Session starten"-Button zeigt Loading-State während Server-Request,
  danach sofortiger Redirect (kein Spinner-Overlay)

### Konzeptionelle Komponentenstruktur
```
LandingPage
├── AppBranding (Logo/Name, minimal)
├── PrimaryAction
│   └── Button "Neue Session starten" (primär, groß, volle Breite)
├── SmartInputArea
│   ├── Label "Session-Nummer oder Moderatoren-Token"
│   ├── InputField (Typ: text, Placeholder: "z.B. 4821")
│   ├── Button "Weiter" (sekundär)
│   └── ErrorMessage (inline, unter dem Feld, nur bei Fehler)
└── AppFooter (minimal, optional)
```

### Barrierefreiheit (A11y)
- Keyboard-Navigation: Tab-Reihenfolge: Button "Neue Session" → Input → Button "Weiter"
- Screen Reader: Button-Label "Neue Session starten", Input-Label sichtbar (kein Placeholder-only)
- Farbkontrast: Alle Text-Elemente ≥4.5:1 (Flat Design, Inter)
- Fehlermeldungen: `role="alert"` damit Screen Reader die Meldung sofort vorliest
- Loading-State: `aria-busy="true"` auf dem Button während des Server-Requests

### Mobile-Verhalten
- Layout: Single Column, kein horizontales Scrollen
- Touch-Targets: Button und Input-Feld ≥44px Höhe
- Keyboard erscheint automatisch mit `inputmode="numeric"` für die 4-stellige Nummer
  (wechselt zu `inputmode="text"` wenn mehr als 4 Zeichen erkannt werden)

---

## 3. Technisches Design
*Ausgefüllt von: /solution-architect — 2026-03-27*

### Component-Struktur

```
App (Router-Root)
├── Route "/"       → LandingPage
└── Route "/session/:id" → SessionPage

LandingPage
├── AppBranding
├── NewSessionButton        – löst Session-Erstellung aus
└── SmartInput              – Input + Weiter-Button + ErrorMessage

SessionPage                 – liest URL-Param "?mod=<token>", entscheidet View
├── ModeratorView           – wenn gültiges mod-Token in URL
└── ParticipantView         – sonst
```

Wiederverwendbar aus bestehenden Komponenten: keine (Scaffold leer)

### Daten-Model

**Im PartyKit Durable Object (Server-seitig, pro Session):**
- `modToken` – String, beim ersten Moderator-Connect gesetzt, danach unveränderlich
- `timerState` – aktueller Timer-Zustand (Status, Dauer, Startzeit, Restzeit) – Details in FEAT-2
- `lastActivityAt` – Timestamp des letzten Timer-Starts (Basis für 3h-Alarm)

**Im Browser (Client-seitig, nicht persistent):**
- `sessionId` – 4-stellige Zahl, aus URL-Param
- `modToken` – aus URL-Param `?mod=`, nur in der Moderatoren-Ansicht vorhanden
- `connectionStatus` – 'connecting' | 'connected' | 'disconnected' (React State)

Gespeichert in: PartyKit Durable Object (kein localStorage, keine Datenbank)

### API / Daten-Fluss

Kein REST-Backend. Alle Kommunikation über WebSocket (PartyKit).

**Session-Erstellung (FEAT-1-spezifisch):**
1. Frontend generiert `sessionId` (zufällige 4-stellige Zahl) + `modToken` (UUID)
2. Frontend versucht WebSocket-Connect zu PartyKit-Room `sessionId`
3. PartyKit-Server: Room existiert noch nicht → neuer Room, `modToken` aus Connect-Params speichern
4. Server bestätigt Session-Start mit initialem `STATE_UPDATE`
5. Frontend navigiert zu `/session/:id?mod=<token>`

**Session-Validierung (Teilnehmer-Join / Moderator-Reconnect):**
- Teilnehmer: Connect zu Room `sessionId` ohne Token → Server prüft ob Room existiert
- Moderator-Reconnect: Connect mit `?mod=<token>` → Server prüft Token gegen gespeicherten Wert
- Fehlerfall: Server sendet `{ type: "ERROR", code: "SESSION_NOT_FOUND" }` → Frontend zeigt Inline-Fehler

**WebSocket Message Types (Session-relevante):**
- Server → Client: `STATE_UPDATE` – kompletter aktueller Zustand (bei Connect + bei Änderung)
- Server → Client: `ERROR` mit Code – Session nicht gefunden, Token ungültig
- Moderator → Server: alle Timer-Kommandos (in FEAT-2 beschrieben)

**3h Session-Expiry:**
- Bei jedem Timer-Start: PartyKit Alarm auf `jetzt + 3 Stunden` gesetzt
- Alarm-Handler: Room verwirft State, sendet `SESSION_EXPIRED` an alle Clients, schließt Connections

### Tech-Entscheidungen

- **React Router v6:** Client-seitiges Routing für `/` und `/session/:id`; kein Server-seitiges
  Routing nötig (Vite SPA)
- **Session-ID-Generierung im Frontend:** Vermeidet Round-Trip zum Server; Kollision wird
  beim Connect erkannt (Server antwortet mit `ROOM_EXISTS`, Frontend generiert neue ID)
- **UUID als modToken:** Ausreichend unvorhersehbar für Security-by-Obscurity (128-bit Entropie);
  kein JWT nötig da kein Auth-Backend vorhanden

### Security-Anforderungen

- **Authentifizierung:** Keine – öffentlich zugänglich by design
- **Autorisierung:** Moderator = wer den `modToken` kennt (URL-Parameter); Server prüft
  bei jeder Moderator-Aktion den Token gegen den gespeicherten Wert
- **Input-Validierung:**
  - Session-Nummer: Client validiert auf 4 Ziffern vor Connect-Versuch
  - ModToken: Server prüft exakten String-Match; keine Teilübereinstimmungen
- **OWASP-relevante Punkte:**
  - XSS: React escaped alle Outputs automatisch; keine innerHTML-Nutzung
  - Token-Brute-Force: UUID (128-bit) macht Enumeration praktisch unmöglich
  - Session-Fixation: nicht anwendbar (kein Login-Flow)
  - Kein CSRF: kein Cookie-basierter Auth

### Dependencies

- `react-router-dom` v6 – Client-seitiges Routing (SPA)

### Test-Setup

- **Unit Tests (Vitest):**
  - Session-ID-Generierung liefert immer 4-stellige Zahl
  - Smart-Input-Logik: 4 Ziffern → Teilnehmer-Flow, UUID-String → Moderator-Flow
  - LandingPage: Fehlerstate wird bei `SESSION_NOT_FOUND` korrekt angezeigt

- **Integration Tests:**
  - PartyKit-Server: neuer Room nimmt ersten modToken an, lehnt falschen Token ab
  - PartyKit-Server: Room-Connect ohne Token wird als Teilnehmer behandelt
  - PartyKit-Server: Session-Expiry-Alarm schließt Room korrekt

- **E2E Tests (Playwright):**
  - Moderator öffnet `/`, klickt "Neue Session starten", landet auf Moderatoren-Ansicht
  - Teilnehmer gibt gültige Session-Nummer ein, landet auf Teilnehmer-Ansicht
  - Ungültige Session-Nummer zeigt Inline-Fehlermeldung
  - Moderator-Reconnect via Token-Eingabe öffnet Moderatoren-Ansicht


---

## 4. Implementierung
*Ausgefüllt von: /developer — 2026-03-28*

### Implementierte Dateien
- `projekt/partykit.json` – PartyKit-Server-Konfiguration
- `projekt/vite.config.ts` – VITE_PARTYKIT_HOST define-Block
- `projekt/src/lib/timerTypes.ts` – Gemeinsame Typen (Client + Server)
- `projekt/src/lib/session.ts` – generateSessionId, generateModToken, formatTime, parseSmartInput
- `projekt/src/party/timer.ts` – PartyKit Durable Object (Session-Management-Logik)
- `projekt/src/hooks/useTimerSession.ts` – WebSocket-Hook mit State-Management
- `projekt/src/components/LandingPage.tsx` – Neue Session + Smart Input
- `projekt/src/components/SessionPage.tsx` – Routing-Container (Mod vs. Participant)
- `projekt/src/components/CopyButton.tsx` – Copy mit "Kopiert!"-Feedback
- `projekt/src/components/ShareSection.tsx` – Collapsible URL-Share
- `projekt/src/components/SessionBadge.tsx` – Session-Nummer-Badge
- `projekt/src/App.tsx` – BrowserRouter mit Routes

### Installierte Dependencies
- `react-router-dom@7.13.2`

### Offene Punkte / Tech-Debt
- Keine

---

## 5. QA Ergebnisse
*Ausgefüllt von: /qa-engineer — 2026-03-28 (Re-QA nach Bug-Fix-Runde 3), /developer Bug-Fix-Runde 4 — 2026-03-28*

### Acceptance Criteria Status
- [x] Haupt-URL zeigt zwei Aktionen ✅
- [x] Klick auf "Neue Session starten" erstellt Session ✅
- [x] Moderatoren-URL Reconnect-Fehlerfall ✅ (QA-014 gefixt: ROOM_EXISTS via ?new=1 Parameter)
- [x] Session-Nummer 4 Ziffern ✅
- [x] Moderatoren-URL mit `?mod=<token>` ✅
- [x] Copy-Buttons mit "Kopiert!"-Bestätigung ✅
- [x] Teilnehmer-URL Format `/session/<nummer>` ✅
- [x] Moderatoren-URL zeigt Steuerungsansicht ✅
- [x] Teilnehmer-URL zeigt read-only Ansicht ✅
- [x] Eingabefeld für Session-Nummern ✅
- [x] Fehlermeldung "Session nicht gefunden" ✅
- [x] Session verfällt nach 3h ✅

### Security-Check
- Token-Validierung via modConnections-Set korrekt implementiert
- Input-Validierung für Session-ID und durationMs vorhanden
- XSS: keine innerHTML-Nutzung, React-Rendering überall
- modToken in WS-URL sichtbar – dokumentierte, bewusste Entscheidung → BUG-FEAT1-QA-003 (Low)

### A11y-Check
- button:focus-visible + input:focus-visible global gesetzt ✅ (UX-002 + UX-013 gefixt)
- aria-controls entfernt, hidden-Attribut korrekt ✅ (UX-007 gefixt)
- ConnectionIndicator role="alert" + aria-live="assertive" im error-State ✅ (UX-018 gefixt)

### Offene Bugs
- BUG-FEAT1-QA-003 – modToken in WS-URL exponiert (Low, bewusste Entscheidung)
- BUG-FEAT1-QA-013 – gegenstandslos durch QA-014 + UX-019 Fix (Low)
- BUG-FEAT1-UX-016 – "Neue Session starten" ohne Klick-Feedback (Low)
- BUG-FEAT1-UX-020 – ShareSection: hidden-Attribut und display:none redundant (Low)

### Bereits behobene Bugs (Bug-Fix-Runden 1–4)
- ~~QA-001~~ Session-Kollisions-Handling · ~~QA-002~~ SESSION_NOT_FOUND · ~~QA-004~~ Token-Only-AC-Text · ~~QA-005~~ CopyButton setTimeout-Leak · ~~QA-006~~ ROOM_EXISTS-Retry-Loop · ~~QA-007~~ Ungültiger Token falscher Screen · ~~QA-008~~ Session-Expiry-Alarm · ~~QA-009~~ ParticipantView Fehlerarten · ~~QA-010~~ ModeratorView SESSION_NOT_FOUND · ~~QA-011~~ INVALID_TOKEN nie gesendet · ~~QA-012~~ ModeratorView 00:00 beim Reconnect
- ~~UX-001~~ Umlaute · ~~UX-002~~ Fokus-/Hover-States · ~~UX-003~~ INVALID_TOKEN kein Escape · ~~UX-004~~ CopyButton Silent Fail · ~~UX-005~~ Placeholder nur Teilnehmer · ~~UX-006~~ URL truncated · ~~UX-007~~ aria-controls defekt · ~~UX-008~~ Unicode-Icons · ~~UX-009~~ ShareSection Hover/Fokus · ~~UX-010~~ ParticipantView Loading-State · ~~UX-011~~ isStarting-State täuschend · ~~UX-012~~ CopyButton Fehlermeldung truncated · ~~UX-013~~ input:focus-visible fehlte · ~~UX-014~~ ModeratorView 00:00 beim Verbindungsaufbau · ~~UX-015~~ ConnectionIndicator ohne Handlungsanweisung

### Summary
- ✅ 11/12 Acceptance Criteria passed (1 nicht bestanden → QA-014 Regression)
- ✅ 5 Bugs gefixt in Runde 3 (QA-011, QA-012, UX-012–015)
- ✅ 6 Bugs gefixt in Runde 4 (QA-014, QA-015, QA-016, UX-017, UX-018, UX-019)
- ❌ 4 Bugs offen (0 High, 0 Medium, 4 Low)

### Production-Ready
✅ Ready – alle High und Medium Bugs behoben (Runde 4). Verbleibende 4 Low Bugs nicht release-blocking.
