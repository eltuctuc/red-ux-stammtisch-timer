# Release History

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
