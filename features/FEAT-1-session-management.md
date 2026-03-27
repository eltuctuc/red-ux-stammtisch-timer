# FEAT-1: Session Management

## Status
Aktueller Schritt: IA/UX

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
