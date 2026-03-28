import { Link } from 'react-router-dom';
import { useTimerSession } from '../hooks/useTimerSession';
import TimerDisplay from './TimerDisplay';
import ConnectionIndicator from './ConnectionIndicator';
import SessionBadge from './SessionBadge';

interface ParticipantViewProps {
  sessionId: string;
}

export default function ParticipantView({ sessionId }: ParticipantViewProps) {
  const { timerState, connectionStatus, connectionError, sessionExpired } = useTimerSession({
    sessionId,
  });

  const status = timerState?.status ?? 'idle';
  // Show loading placeholder while connecting and no state received yet
  const displayMs = connectionStatus === 'connecting' && !timerState
    ? null
    : (timerState?.displayRemainingMs ?? 0);
  const isWarning = timerState?.isWarning ?? false;

  if (sessionExpired) {
    return (
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <p role="alert" style={{ fontSize: '18px', fontWeight: 500 }}>
          Session abgelaufen.
        </p>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Diese Session war 3 Stunden inaktiv und wurde beendet.
        </p>
        <Link
          to="/"
          style={{
            color: 'var(--color-accent)',
            fontWeight: 500,
            textDecoration: 'none',
            padding: 'var(--space-2) var(--space-4)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          Zurück zur Startseite
        </Link>
      </main>
    );
  }

  if (connectionError) {
    const isNotFound = connectionError.code === 'SESSION_NOT_FOUND';
    const title = isNotFound ? 'Session nicht gefunden.' : 'Verbindungsfehler.';
    const description = isNotFound
      ? 'Diese Session existiert nicht oder ist abgelaufen.'
      : 'Die Verbindung konnte nicht hergestellt werden. Bitte lade die Seite neu.';

    return (
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <p
          role="alert"
          style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)' }}
        >
          {title}
        </p>
        <p style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
        <Link
          to="/"
          style={{
            color: 'var(--color-accent)',
            fontWeight: 500,
            textDecoration: 'none',
            padding: 'var(--space-2) var(--space-4)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          Zurück zur Startseite
        </Link>
      </main>
    );
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: 'var(--space-4)',
      }}
    >
      <TimerDisplay status={status} displayMs={displayMs} isWarning={isWarning} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
        <SessionBadge sessionId={sessionId} />
        <ConnectionIndicator status={connectionStatus} />
      </div>
    </main>
  );
}
