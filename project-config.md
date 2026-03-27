# Projekt-Konfiguration

## Tech-Stack
- Scope-Typ: Funktionierender Prototyp
- Frontend: React 19 + Vite (TypeScript)
- Backend: PartyKit (Cloudflare Workers + Durable Objects) – Realtime-Sessions
- Datenbank: Keine – Timer-Zustand lebt ausschließlich in der PartyKit-Session

## Team-Setup
- Developer aufgeteilt (Frontend/Backend): Nein – ein Stack, ein Agent

## Verzeichnisse
- Codeverzeichnis: projekt/

## Projektstruktur
- Komponenten: projekt/src/components/ (noch anzulegen)
- Seiten/Views: projekt/src/App.tsx
- API-Routen: –
- PartyKit Server: projekt/src/party/ (noch anzulegen)
- State/Stores: –

## Git / GitHub
- Git initialisiert: Ja
- Git-Basis: Projekt-Root (/)
- GitHub-Repository: https://github.com/eltuctuc/red-ux-stammtisch-timer
- Repository-Inhalt: Alles (Code + Projektdokumentation)

## Versionierung
- Aktuelle Version: 0.0.0
- Strategie: SemVer (MAJOR.MINOR.PATCH)
  - PATCH → Bug-Fix-Runde abgeschlossen (/qa-engineer)
  - MINOR → Feature Production-Ready (/qa-engineer)
  - MAJOR → Intentionaler Release an echte Nutzer (manuell)
- Nächste Version: 0.1.0

## Namenskonvention
- Feature-IDs: FEAT-X
- Nächste freie ID: FEAT-3
