# Release History

## 2026-03-29 – v0.2.0
### Neue Features
- **FEAT-2 – Timer:** Moderatoren können Timebox-Dauern per Preset oder Freifeld setzen und den Countdown starten/pausieren/zurücksetzen; alle Teilnehmer sehen den Timer in Echtzeit mit Sound-Alert bei Ablauf.

### Bug Fixes
- **BUG-FEAT2-QA-016:** ShareSection Auto-Open: useState(initiallyOpen) reagierte nicht auf async Prop-Änderungen nach erstem STATE_UPDATE – fix via useEffect([initiallyOpen]). *(Severity: Medium)*
- **BUG-FEAT2-UX-024:** CopyButton Moderatoren-Link erhält aria-describedby zum Warnungstext – Screenreader-Nutzer hören Sicherheitshinweis beim Tab-Fokus. *(Severity: Medium)*
- **BUG-FEAT2-UX-025:** aria-live-Levels getrennt: assertive nur für expired, polite für paused. *(Severity: Medium)*
- **BUG-FEAT2-UX-026:** Disabled-Darstellung in TimerControls vereinheitlicht (opacity:0.5 für beide Button-Typen). *(Severity: Low)*
- **BUG-FEAT2-UX-027 / QA-017:** Redundanter btn?.focus()-Call im [initiallyOpen]-Effect entfernt – Focus-Management liegt korrekt beim [isOpen]-Effect nach DOM-Update. *(Severity: Medium)*

## 2026-03-28 – v0.1.1
### Bug Fixes
- **BUG-FEAT1-QA-020:** modToken in DO-Storage persistiert – überlebt Durable Object Restarts, verhindert Auth-Übernahme nach Neustart. *(Severity: High)*
- **BUG-FEAT1-QA-017:** `?new=1` wird nach erfolgreichem Connect aus der Browser-URL entfernt. *(Severity: Medium)*
- **BUG-FEAT1-QA-019:** `SET_DURATION` mit NaN oder nicht-numerischen Werten wird serverseitig abgefangen. *(Severity: Medium)*
- **BUG-FEAT1-UX-021:** "Seite neu laden"-Button im ConnectionIndicator hat 44px Touch-Target. *(Severity: Medium)*
- **BUG-FEAT1-UX-022:** Fehler aus ROOM_EXISTS-Erschöpfung erscheint beim primären Button, nicht im SmartInput. *(Severity: Medium)*
- **BUG-FEAT1-UX-024:** SessionPage-Fehlerscreen kündigt Fehler via `role="alert"` für Screen Reader an. *(Severity: Medium)*
- **BUG-FEAT1-UX-026:** CopyButton "Kopiert!"-Feedback via `aria-live="polite"` für Screen Reader zugänglich. *(Severity: Medium)*

## 2026-03-28 – v0.1.0
### Neue Features
- **FEAT-1 – Session Management:** Moderatoren können Sessions starten und teilen; Teilnehmer treten per Link oder 4-stelliger Nummer bei; Sessions verfallen nach 3h Inaktivität.

### Bug Fixes
- **BUG-FEAT1-QA-006:** ROOM_EXISTS-Retry-Schleife durch max. 3 Versuche mit Abbruchbedingung begrenzt. *(Severity: High)*
- **BUG-FEAT1-QA-008:** Session-Expiry-Alarm wird jetzt auch bei Session-Erstellung gesetzt, nicht nur bei Timer-Aktionen. *(Severity: High)*
- **BUG-FEAT1-QA-010:** Abgelaufene Sessions werden nicht mehr stillschweigend neu erstellt – Moderatoren erhalten SESSION_NOT_FOUND. *(Severity: High)*
- **BUG-FEAT1-QA-001:** Session-Kollisions-Handling für ROOM_EXISTS implementiert. *(Severity: High)*
- **BUG-FEAT1-QA-002:** SESSION_NOT_FOUND wird jetzt korrekt gesendet. *(Severity: High)*
- **BUG-FEAT1-UX-001:** Fehlende Umlaute in UI-Texten korrigiert. *(Severity: High)*
- **BUG-FEAT1-UX-003:** INVALID_TOKEN-State hat jetzt einen Escape-Weg zur Startseite. *(Severity: High)*
