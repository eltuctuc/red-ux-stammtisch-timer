# BUG-FEAT1-QA-017: `?new=1` verbleibt permanent in der Browser-URL der Moderatoren-Ansicht

- **Feature:** FEAT-1 – Session Management
- **Severity:** Medium
- **Bereich:** Functional
- **Gefunden von:** QA Engineer
- **Status:** Open

## Beschreibung

Nach dem Redirect von `handleNewSession()` (`LandingPage.tsx` Zeile 27) landet der Moderator auf `/session/1234?mod=TOKEN&new=1`. Der `?new=1`-Parameter bleibt dauerhaft in der Browser-Adressleiste sichtbar – er wird nach erfolgreicher Session-Erstellung nie aus der URL entfernt.

**Konkrete Konsequenz:** Die `ShareSection` konstruiert die Moderatoren-URL korrekt ohne `?new=1` (Zeile 16: `\`${origin}/session/${sessionId}?mod=${modToken}\``). Wer aber die URL aus der Browser-Adressleiste kopiert statt den Copy-Button zu verwenden, erhält eine URL mit `?new=1`.

**Was passiert mit dieser `?new=1`-URL beim Reconnect:**

Der Server-Code in `timer.ts` (Zeile 51-71) prüft die Branches in dieser Reihenfolge:
1. `if (modToken === null)` → nein (Token bereits gesetzt)
2. `else if (tokenParam === modToken)` → **ja** → korrekter Reconnect

Da Branch 2 greift, bevor `isNewSession` ausgewertet wird, funktioniert der Reconnect mit `?new=1`-URL technisch korrekt.

**Aber:** Der Moderator sieht eine URL mit einem technischen Implementierungsdetail (`?new=1`), das nach außen sichtbar ist. Zusätzlich kann der `?new=1`-Parameter zu Verwirrung führen falls zukünftige Code-Änderungen die Branch-Reihenfolge in `timer.ts` ändern – dann würde ein Reconnect mit `?new=1` fälschlicherweise als Kollisions-Versuch gewertet werden (ROOM_EXISTS statt Reconnect), weil `tokenParam === modToken` nicht mehr vor `isNewSession` geprüft wird.

## Steps to Reproduce

1. Haupt-URL öffnen, "Neue Session starten" klicken
2. URL in der Browser-Adressleiste beobachten
3. Expected: URL lautet `/session/1234?mod=TOKEN` (nach erfolgreicher Erstellung)
4. Actual: URL lautet `/session/1234?mod=TOKEN&new=1` – `?new=1` bleibt dauerhaft sichtbar

## Betroffene Datei

- `projekt/src/components/LandingPage.tsx` Zeile 27: navigate mit `&new=1` ohne nachträgliches Cleanup
- `projekt/src/components/ModeratorView.tsx` oder `projekt/src/components/SessionPage.tsx`: kein URL-Cleanup nach erfolgreicher Session-Erstellung

## Fix-Hinweis

Nach dem ersten STATE_UPDATE (Session erfolgreich erstellt) kann `navigate` mit `replace: true` auf die saubere URL ohne `?new=1` umleiten. Alternativ kann `useEffect` in `ModeratorView.tsx` nach empfangener STATE_UPDATE die URL bereinigen.

## Priority

Fix before release
