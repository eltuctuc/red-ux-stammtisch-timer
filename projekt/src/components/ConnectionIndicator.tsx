type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

const messages: Record<Exclude<ConnectionStatus, 'connected'>, string> = {
  connecting: 'Verbindung wird hergestellt...',
  disconnected: 'Verbindung unterbrochen – wird neu verbunden...',
  error: 'Verbindungsfehler',
};

export default function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  if (status === 'connected') return null;

  const message = messages[status];

  return (
    <div
      role="status"
      aria-live="polite"
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
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: status === 'error' ? 'var(--color-danger)' : 'var(--color-accent)',
          animation: status !== 'error' ? 'pulse 1.4s ease-in-out infinite' : 'none',
        }}
      />
      {message}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
