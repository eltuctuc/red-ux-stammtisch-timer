import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateSessionId, generateModToken, parseSmartInput } from '../lib/session';

interface LocationState {
  reconnectError?: string;
  input?: string;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as LocationState;

  const [inputValue, setInputValue] = useState(locationState.input ?? '');
  const [inputError, setInputError] = useState<string | null>(locationState.reconnectError ?? null);
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);

  // Eingabe-Modus: numeric bei ≤4 Zeichen, text sonst
  const inputMode = inputValue.length <= 4 ? 'numeric' : 'text';

  function handleNewSession() {
    const sessionId = generateSessionId();
    const modToken = generateModToken();
    // BUG-FEAT1-QA-014: ?new=1 tells the server this is a creation attempt (not a reconnect)
    navigate(`/session/${sessionId}?mod=${modToken}&new=1`);
  }

  function handleSmartInput(e: React.FormEvent) {
    e.preventDefault();
    setInputError(null);

    if (!inputValue.trim()) {
      setInputError('Bitte eine Session-Nummer oder Moderatoren-URL eingeben.');
      return;
    }

    const result = parseSmartInput(inputValue);

    if (result.type === 'participant') {
      navigate(`/session/${result.sessionId}`);
    } else if (result.type === 'moderator') {
      navigate(`/session/${result.sessionId}?mod=${result.token}`);
    } else {
      setInputError(
        'Eingabe nicht erkannt. Bitte gib eine 4-stellige Session-Nummer oder deine vollständige Moderatoren-URL ein.'
      );
    }
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
        }}
      >
        {/* Branding */}
        <header style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 6vw, 2rem)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Workshop Timer
          </h1>
          <p
            style={{
              marginTop: 'var(--space-2)',
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Echtzeit-Timer für Workshops und Meetings
          </p>
        </header>

        {/* Neue Session */}
        <section aria-label="Neue Session starten">
          <button
            type="button"
            onClick={handleNewSession}
            onMouseEnter={() => setPrimaryHovered(true)}
            onMouseLeave={() => setPrimaryHovered(false)}
            style={{
              width: '100%',
              minHeight: '52px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: primaryHovered ? 'var(--color-accent-hover)' : 'var(--color-accent)',
              color: 'white',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
          >
            Neue Session starten
          </button>
        </section>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>oder</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
        </div>

        {/* Smart Input */}
        <section aria-label="Bestehende Session fortsetzen">
          <form onSubmit={handleSmartInput} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label
                htmlFor="smart-input"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}
              >
                Session-Nummer oder Moderatoren-Link
              </label>
              <input
                id="smart-input"
                type="text"
                inputMode={inputMode}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setInputError(null);
                }}
                placeholder="4-stellige Nummer oder Moderatoren-URL"
                aria-describedby={inputError ? 'smart-input-error' : 'smart-input-hint'}
                aria-invalid={inputError ? 'true' : undefined}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 var(--space-4)',
                  border: `1px solid ${inputError ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '16px',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  transition: 'border-color var(--transition-fast)',
                }}
              />

              {inputError ? (
                <p
                  id="smart-input-error"
                  role="alert"
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-danger)',
                  }}
                >
                  {inputError}
                </p>
              ) : (
                <p
                  id="smart-input-hint"
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Als Teilnehmer: 4-stellige Nummer. Als Moderator: vollständige Moderatoren-URL.
                </p>
              )}

              <button
                type="submit"
                onMouseEnter={() => setSubmitHovered(true)}
                onMouseLeave={() => setSubmitHovered(false)}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: submitHovered ? 'var(--color-border)' : 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
              >
                Weiter
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
