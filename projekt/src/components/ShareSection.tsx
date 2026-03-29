import { useState, useEffect, useRef } from 'react';
import CopyButton from './CopyButton';

interface ShareSectionProps {
  sessionId: string;
  modToken: string;
  initiallyOpen?: boolean;
}

export default function ShareSection({ sessionId, modToken, initiallyOpen = false }: ShareSectionProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isHovered, setIsHovered] = useState(false);

  // BUG-FEAT2-UX-006: focus first interactive element when section is opened by user
  // BUG-FEAT2-UX-010: return focus to toggle button when section is closed
  const firstCopyWrapperRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isOpen) {
      const btn = firstCopyWrapperRef.current?.querySelector<HTMLButtonElement>('button');
      btn?.focus();
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [isOpen]);

  // BUG-FEAT2-QA-016 + BUG-FEAT2-UX-022: open when initiallyOpen transitions to true.
  //   useState(initiallyOpen) only captures the mount-time value; this effect reacts to
  //   the prop becoming true after the first STATE_UPDATE arrives (async).
  //   Focus is handled by the [isOpen] effect above after the DOM update.
  useEffect(() => {
    if (initiallyOpen) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initiallyOpen]);

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
      {/* aria-controls removed: element is always in DOM, aria-expanded is sufficient */}
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          minHeight: '48px',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isHovered ? 'var(--color-bg)' : 'var(--color-surface)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          borderRadius: isOpen ? '0' : 'inherit',
          transition: 'background var(--transition-fast)',
        }}
      >
        Session teilen
        <span aria-hidden="true" style={{ fontSize: '12px' }}>
          {isOpen ? '▴' : '▾'}
        </span>
      </button>

      <div
        id="share-section-content"
        hidden={!isOpen}
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          display: isOpen ? 'flex' : 'none',
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
        <div ref={firstCopyWrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Link für Teilnehmer
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

        {/* Moderatoren-URL – BUG-FEAT2-UX-018: visuelle Warnung vor versehentlichem Teilen */}
        {/* BUG-FEAT2-UX-021: role="region" + aria-label kennzeichnet den Bereich semantisch als Warnung */}
        <div
          role="region"
          aria-label="Moderatoren-Link – nur für dich"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            background: 'var(--timer-bg-warning)',
            border: '1px solid #E8C54A',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
          }}
        >
          <p style={{ fontSize: '14px', color: '#7A4900', fontWeight: 600 }}>
            Mein Moderatoren-Link
          </p>
          <p id="mod-url-warning" style={{ fontSize: '13px', color: '#7A4900' }}>
            Nur für dich – wer diesen Link hat, kann den Timer steuern.
          </p>
          <code
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            {moderatorUrl}
          </code>
          <CopyButton value={moderatorUrl} label="Moderatoren-Link kopieren" describedBy="mod-url-warning" />
        </div>
      </div>
    </div>
  );
}
