import { formatTime } from '../lib/session';

type TimerStatus = 'idle' | 'running' | 'paused' | 'expired';

interface TimerDisplayProps {
  status: TimerStatus;
  displayMs: number | null;
  isWarning: boolean;
}

const bgMap: Record<TimerStatus, string> = {
  idle: 'var(--timer-bg-running)',
  running: 'var(--timer-bg-running)',
  paused: 'var(--timer-bg-paused)',
  expired: 'var(--timer-bg-expired)',
};

const textMap: Record<TimerStatus, string> = {
  idle: 'var(--timer-text-running)',
  running: 'var(--timer-text-running)',
  paused: 'var(--timer-text-paused)',
  expired: 'var(--timer-text-expired)',
};

export default function TimerDisplay({ status, displayMs, isWarning }: TimerDisplayProps) {
  const bg = isWarning ? 'var(--timer-bg-warning)' : bgMap[status];
  const color = isWarning ? 'var(--timer-text-warning)' : textMap[status];

  const label = displayMs === null ? '--:--' : formatTime(displayMs);

  return (
    <div
      style={{
        width: '100%',
        background: bg,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)',
        transition: `background var(--transition-normal), color var(--transition-normal)`,
        borderRadius: 'var(--radius-lg)',
        minHeight: '160px',
        position: 'relative',
      }}
    >
      {/* BUG-FEAT2-UX-025: two separate live regions – assertive only for expired (immediate interruption
          justified), polite for paused (routine action, no need to disrupt ongoing reading) */}
      <span
        aria-live="assertive"
        aria-atomic="true"
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}
      >
        {status === 'expired' ? 'Zeit abgelaufen' : ''}
      </span>
      <span
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}
      >
        {status === 'paused' ? 'Timer pausiert' : ''}
      </span>

      <time
        role="timer"
        aria-label={displayMs === null ? 'Verbindung wird aufgebaut' : `Verbleibende Zeit: ${label}`}
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: 'clamp(4rem, 20vw, 10rem)',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {label}
      </time>
    </div>
  );
}
