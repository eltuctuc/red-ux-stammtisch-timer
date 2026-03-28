/** Generiert zufällige 4-stellige Session-Nummer (1000–9999) */
export function generateSessionId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return String(num);
}

/** Generiert UUID v4 als mod token */
export function generateModToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback für ältere Umgebungen
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Formatiert Millisekunden als MM:SS */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export type SmartInputResult =
  | { type: 'participant'; sessionId: string }
  | { type: 'moderator'; sessionId: string; token: string }
  | { type: 'invalid' };

/**
 * Parst Smart-Input:
 * - 4-stellige Zahl → Teilnehmer
 * - UUID oder URL mit ?mod= → Moderator
 * - Sonst → invalid
 */
export function parseSmartInput(input: string): SmartInputResult {
  const trimmed = input.trim();

  // 4-stellige Zahl → Teilnehmer
  if (/^\d{4}$/.test(trimmed)) {
    return { type: 'participant', sessionId: trimmed };
  }

  // Vollständige URL mit mod-Param prüfen
  try {
    const url = new URL(trimmed);
    const modToken = url.searchParams.get('mod');
    // Pfad muss /session/<4-stellige-Zahl> sein
    const match = url.pathname.match(/\/session\/(\d{4})$/);
    if (match && modToken) {
      return { type: 'moderator', sessionId: match[1], token: modToken };
    }
  } catch {
    // Kein gültiger URL – weiter prüfen
  }

  // UUID-Format als Token (direkt eingegeben)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    // Token allein ist kein vollständiger Reconnect – wir brauchen die sessionId.
    // Pragmatische Entscheidung: Token-only-Eingabe ist invalid, da sessionId fehlt.
    // Nutzer muss die vollständige Moderatoren-URL eingeben.
    return { type: 'invalid' };
  }

  // Relativer Pfad oder Pfad ohne Host – versuche URL mit Dummy-Origin zu parsen
  try {
    const url = new URL(trimmed, 'https://dummy.local');
    const modToken = url.searchParams.get('mod');
    const match = url.pathname.match(/\/session\/(\d{4})$/);
    if (match && modToken) {
      return { type: 'moderator', sessionId: match[1], token: modToken };
    }
  } catch {
    // Nicht parsebar
  }

  return { type: 'invalid' };
}
