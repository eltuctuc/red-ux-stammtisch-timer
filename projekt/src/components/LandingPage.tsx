import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSessionId, generateModToken, parseSmartInput } from '../lib/session';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  // Eingabe-Modus: numeric bei ≤4 Zeichen, text sonst
  const inputMode = inputValue.length <= 4 ? 'numeric' : 'text';

  async function handleNewSession() {
    setIsStarting(true);
    try {
      const sessionId = generateSessionId();
      const modToken = generateModToken();
      navigate(`/session/${sessionId}?mod=${modToken}`);
    } finally {
      setIsStarting(false);
    }
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
        'Eingabe nicht erkannt. Bitte gib eine 4-stellige Session-Nummer oder die vollstandige Moderatoren-URL ein.'
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
            Echtzeit-Timer fur Workshops und Meetings
          </p>
        </header>

        {/* Neue Session */}
        <section aria-label="Neue Session starten">
          <button
            type="button"
            onClick={handleNewSession}
            disabled={isStarting}
            aria-busy={isStarting}
            style={{
              width: '100%',
              minHeight: '52px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isStarting ? 'var(--color-border)' : 'var(--color-accent)',
              color: isStarting ? 'var(--color-text-secondary)' : 'white',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '16px',
              cursor: isStarting ? 'not-allowed' : 'pointer',
              transition: 'background var(--transition-fast)',
            }}
          >
            {isStarting ? 'Wird gestartet...' : 'Neue Session starten'}
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
                htmlFor={inputId}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}
              >
                Session-Nummer oder Moderatoren-Link
              </label>
              <input
                id={inputId}
                type="text"
                inputMode={inputMode}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setInputError(null);
                }}
                placeholder="z.B. 4821"
                aria-describedby={inputError ? errorId : undefined}
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
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = inputError
                    ? 'var(--color-danger)'
                    : 'var(--color-accent)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = inputError
                    ? 'var(--color-danger)'
                    : 'var(--color-border)';
                }}
              />

              {inputError && (
                <p
                  id={errorId}
                  role="alert"
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-danger)',
                  }}
                >
                  {inputError}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
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
