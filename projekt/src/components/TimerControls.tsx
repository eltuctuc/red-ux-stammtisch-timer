type TimerStatus = 'idle' | 'running' | 'paused' | 'expired';

interface TimerControlsProps {
  status: TimerStatus;
  totalDurationMs: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  disabled?: boolean;
}

const primaryStyle = (disabled: boolean): React.CSSProperties => ({
  minHeight: '44px',
  padding: '0 var(--space-6)',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: disabled ? 'var(--color-border)' : 'var(--color-accent)',
  color: disabled ? 'var(--color-text-secondary)' : 'white',
  fontWeight: 600,
  fontSize: '15px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background var(--transition-fast)',
});

const secondaryStyle = (disabled: boolean): React.CSSProperties => ({
  minHeight: '44px',
  padding: '0 var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: disabled ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
  fontWeight: 500,
  fontSize: '15px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'background var(--transition-fast)',
});

export default function TimerControls({
  status,
  totalDurationMs,
  onStart,
  onPause,
  onResume,
  onReset,
  disabled,
}: TimerControlsProps) {
  const hasDuration = totalDurationMs > 0;
  const isDisabled = disabled ?? false;

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {status === 'idle' && (
        <button
          type="button"
          onClick={onStart}
          disabled={isDisabled || !hasDuration}
          aria-label="Timer starten"
          style={primaryStyle(isDisabled || !hasDuration)}
        >
          Starten
        </button>
      )}

      {/* BUG-FEAT2-UX-009: rename button in expired state to clarify it repeats same duration */}
      {status === 'expired' && (
        <button
          type="button"
          onClick={onStart}
          disabled={isDisabled || !hasDuration}
          aria-label="Timer nochmal starten"
          style={primaryStyle(isDisabled || !hasDuration)}
        >
          Nochmal starten
        </button>
      )}

      {status === 'running' && (
        <button
          type="button"
          onClick={onPause}
          disabled={isDisabled}
          aria-label="Timer pausieren"
          style={primaryStyle(isDisabled)}
        >
          Pause
        </button>
      )}

      {status === 'paused' && (
        <button
          type="button"
          onClick={onResume}
          disabled={isDisabled}
          aria-label="Timer fortsetzen"
          style={primaryStyle(isDisabled)}
        >
          Weiter
        </button>
      )}

      {/* Reset immer sichtbar wenn Dauer gesetzt – nicht bei initialem idle ohne Dauer */}
      {hasDuration && (
        <button
          type="button"
          onClick={onReset}
          disabled={isDisabled}
          aria-label="Timer zurücksetzen"
          style={secondaryStyle(isDisabled)}
        >
          Zurücksetzen
        </button>
      )}
    </div>
  );
}
