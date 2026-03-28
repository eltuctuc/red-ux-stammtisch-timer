# BUG-FEAT1-UX-004: CopyButton – kein Nutzerfeedback bei fehlgeschlagenem Kopiervorgang

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Feedback
- **Gefunden von:** UX Reviewer
- **Persona:** Mia (Moderator)
- **Status:** Fixed

## Beschreibung
In `CopyButton.tsx` (Zeilen 27–35) wird ein Clipboard-Fehler stillschweigend ignoriert (`catch {}`).
Wenn der Browser den Clipboard-Zugriff verweigert (z. B. wegen fehlender Permissions,
iframe-Kontext oder älterer Browser ohne HTTPS), passiert für den Nutzer nichts:
Kein "Kopieren fehlgeschlagen"-Feedback, kein Hinweis wie die URL alternativ bezogen werden kann.

Mia klickt auf "Teilnehmer-Link kopieren", der Button wechselt nicht zu "Kopiert!",
und sie weiß nicht, ob die URL jetzt in der Zwischenablage ist oder nicht.

## Betroffene Datei(en)
- `projekt/src/components/CopyButton.tsx`

## Expected (aus Nutzerperspektive)
Bei Kopier-Fehler: sichtbare Rückmeldung (z. B. "Kopieren fehlgeschlagen – bitte manuell kopieren")
oder zumindest das Ausbleiben der "Kopiert!"-Bestätigung als implizites Signal.

## Actual
Silent fail. Der Button zeigt weder "Kopiert!" noch eine Fehlermeldung.
Der Nutzerin fehlt jede Orientierung ob die Aktion erfolgreich war.

## Fix-Hinweis
Im `catch`-Block einen Fehler-State setzen (z. B. `setCopyError(true)`) und
kurz eine alternative Meldung anzeigen, z. B. "Nicht kopiert – bitte manuell kopieren"
oder den URL-Text selektieren damit Nutzer ihn manuell kopieren können.

## Priority
Fix before release

## Fix (2026-03-28)
CopyButton.tsx: copyError-State im catch-Block gesetzt. Zeigt 'Nicht kopiert – bitte manuell kopieren' für 3 Sekunden mit rotem Hintergrund.
