interface SessionBadgeProps {
  sessionId: string;
}

export default function SessionBadge({ sessionId }: SessionBadgeProps) {
  return (
    <p
      aria-label={`Session-Nummer: ${sessionId}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        padding: 'var(--space-1) var(--space-3)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        fontVariantNumeric: 'tabular-nums',
        background: 'var(--color-surface)',
      }}
    >
      <span style={{ fontWeight: 400 }}>Session:</span>
      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{sessionId}</span>
    </p>
  );
}
