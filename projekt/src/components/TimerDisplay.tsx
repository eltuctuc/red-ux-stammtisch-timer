import { formatTime } from '../lib/session';

type TimerStatus = 'idle' | 'running' | 'paused' | 'expired';

interface TimerDisplayProps {
  status: TimerStatus;
  displayMs: number;
  isWarning: boolean;
}

const bgMap: Record<TimerStatus, string> = {
  idle: 'var(--timer-bg-running)',
  running: 'var(--timer-bg-running)',
  paused: 'var(--timer-bg-running)',
  expired: 'var(--timer-bg-expired)',
};

const textMap: Record<TimerStatus, string> = {
  idle: 'var(--timer-text-running)',
  running: 'var(--timer-text-running)',
  paused: 'var(--timer-text-running)',
  expired: 'var(--timer-text-expired)',
};

export default function TimerDisplay({ status, displayMs, isWarning }: TimerDisplayProps) {
  const bg = isWarning ? 'var(--timer-bg-warning)' : bgMap[status];
  const color = isWarning ? 'var(--timer-text-warning)' : textMap[status];

  const label = formatTime(displayMs);

  // Screen reader: assertive nur bei expired (sofortige Ankündigung)
  const ariaLive = status === 'expired' ? 'assertive' : 'polite';

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
      }}
    >
      <time
        role="timer"
        aria-live={ariaLive}
        aria-label={`Verbleibende Zeit: ${label}`}
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
