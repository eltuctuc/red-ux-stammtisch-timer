import { useState, useEffect } from 'react';
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

  const label = formatTime(displayMs);

  // Announce only meaningful state changes to screen readers
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    if (status === 'expired') setAnnouncement('Zeit abgelaufen');
    else if (status === 'paused') setAnnouncement('Timer pausiert');
    else setAnnouncement('');
  }, [status]);

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
      {/* Visually hidden live region – only announces status changes, not every tick */}
      <span
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {announcement}
      </span>

      <time
        role="timer"
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
