type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

const nonErrorMessages: Record<'connecting' | 'disconnected', string> = {
  connecting: 'Verbindung wird hergestellt...',
  disconnected: 'Verbindung unterbrochen – wird neu verbunden...',
};

export default function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  if (status === 'connected') return null;

  const isError = status === 'error';

  return (
    <div
      // BUG-FEAT1-UX-018: error state uses role="alert" + aria-live="assertive" for immediate announcement
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
      }}
    >
      {/* BUG-FEAT2-UX-023: className used by inline media query to fully disable animation */}
      <span
        aria-hidden="true"
        className="connection-dot"
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          flexShrink: 0,
          background: isError ? 'var(--color-danger)' : 'var(--color-accent)',
          animation: !isError ? 'pulse 1.4s ease-in-out infinite' : 'none',
        }}
      />
      {isError ? (
        <>
          Verbindungsfehler –{' '}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 var(--space-1)',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--color-accent)',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Seite neu laden
          </button>
        </>
      ) : (
        nonErrorMessages[status]
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (prefers-reduced-motion: reduce) {
          .connection-dot {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
