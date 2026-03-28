import { useState } from 'react';
import CopyButton from './CopyButton';

interface ShareSectionProps {
  sessionId: string;
  modToken: string;
  initiallyOpen?: boolean;
}

export default function ShareSection({ sessionId, modToken, initiallyOpen = false }: ShareSectionProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const participantUrl = `${origin}/session/${sessionId}`;
  const moderatorUrl = `${origin}/session/${sessionId}?mod=${modToken}`;

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="share-section-content"
        style={{
          width: '100%',
          minHeight: '48px',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-surface)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          borderRadius: isOpen ? '0' : 'inherit',
        }}
      >
        Session teilen
        <span aria-hidden="true" style={{ fontSize: '12px' }}>
          {isOpen ? '▴' : '▾'}
        </span>
      </button>

      {isOpen && (
        <div
          id="share-section-content"
          style={{
            padding: 'var(--space-4)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            background: 'var(--color-bg)',
          }}
        >
          {/* Session-Nummer groß und lesbar */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
              Session-Nummer
            </p>
            <p
              style={{
                fontSize: 'clamp(2rem, 10vw, 3.5rem)',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.15em',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              {sessionId}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          {/* Teilnehmer-URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Link fur Teilnehmer
            </p>
            <code
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              {participantUrl}
            </code>
            <CopyButton value={participantUrl} label="Teilnehmer-Link kopieren" />
          </div>

          {/* Moderatoren-URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Mein Moderatoren-Link (privat halten)
            </p>
            <code
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              {moderatorUrl.slice(0, 60)}&hellip;
            </code>
            <CopyButton value={moderatorUrl} label="Moderatoren-Link kopieren" />
          </div>
        </div>
      )}
    </div>
  );
}
