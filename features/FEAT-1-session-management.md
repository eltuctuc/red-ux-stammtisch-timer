# FEAT-1: Session Management

## Status
Aktueller Schritt: Spec

## Abhängigkeiten
- Benötigt: Keine

---

## 1. Feature Spec
*Ausgefüllt von: /requirements — 2026-03-27*

### Beschreibung
Ein Moderator öffnet die Haupt-URL und erhält eine neue Session mit einzigartiger
Session-Nummer. Er bekommt zwei URLs: eine Moderatoren-URL (mit Secret-Token) und
eine Teilnehmer-URL. Teilnehmer gelangen entweder über die direkte URL oder durch
manuelle Eingabe der Session-Nummer auf der Haupt-URL in die Session. Der Moderator
kann seine Session nach einem Tab-Schließen wiederherstellen. Sessions verfallen nach
3 Stunden ohne neuen Timer-Start.

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
- Als Moderator möchte ich beim Aufrufen der Haupt-URL automatisch eine neue Session
  erhalten, um sofort loslegen zu können ohne manuelle Einrichtung.
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
- [ ] Beim Aufruf der Haupt-URL (`/`) wird automatisch eine neue Session erstellt
      und die Moderatoren-Ansicht angezeigt
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
- **Ungültige Session-Nummer eingegeben:** Fehlermeldung "Session nicht gefunden",
  Eingabefeld bleibt aktiv für erneute Eingabe
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
