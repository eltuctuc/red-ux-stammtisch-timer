import { useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateSessionId, generateModToken } from '../lib/session';
import { useTimerSession } from '../hooks/useTimerSession';
import TimerDisplay from './TimerDisplay';
import ConnectionIndicator from './ConnectionIndicator';
import PresetButtons from './PresetButtons';
import CustomTimeInput from './CustomTimeInput';
import TimerControls from './TimerControls';
import ShareSection from './ShareSection';

interface ModeratorViewProps {
  sessionId: string;
  modToken: string;
}

export default function ModeratorView({ sessionId, modToken }: ModeratorViewProps) {
  const navigate = useNavigate();
  const { timerState, connectionStatus, connectionError, sessionExpired, sendCommand } =
    useTimerSession({ sessionId, modToken });

  // Auto-retry with new session ID on collision (room already owned by someone else)
  useEffect(() => {
    if (connectionError?.code === 'ROOM_EXISTS') {
      const newSessionId = generateSessionId();
      const newModToken = generateModToken();
      navigate(`/session/${newSessionId}?mod=${newModToken}`, { replace: true });
    }
  }, [connectionError, navigate]);

  const handleSetDuration = useCallback(
    (ms: number) => {
      sendCommand({ type: 'SET_DURATION', durationMs: ms });
    },
    [sendCommand]
  );

  const handleStart = useCallback(() => sendCommand({ type: 'START' }), [sendCommand]);
  const handlePause = useCallback(() => sendCommand({ type: 'PAUSE' }), [sendCommand]);
  const handleResume = useCallback(() => sendCommand({ type: 'RESUME' }), [sendCommand]);
  const handleReset = useCallback(() => sendCommand({ type: 'RESET' }), [sendCommand]);

  const status = timerState?.status ?? 'idle';
  const totalDurationMs = timerState?.totalDurationMs ?? 0;
  const displayMs = timerState?.displayRemainingMs ?? 0;
  const isWarning = timerState?.isWarning ?? false;

  // Preset ist aktiv wenn totalDurationMs genau einem Preset entspricht
  const presetValues = [2, 5, 10, 15, 30].map((m) => m * 60 * 1000);
  const selectedPreset = presetValues.includes(totalDurationMs) ? totalDurationMs : null;

  // ShareSection beim ersten Laden aufgeklappt wenn Timer noch nie gestartet wurde
  const isNewSession = status === 'idle' && totalDurationMs === 0;

  // Controls deaktivieren bei Verbindungsproblemen
  const controlsDisabled = connectionStatus !== 'connected';

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
          Neue Session starten
        </Link>
      </main>
    );
  }

  if (connectionError?.code === 'INVALID_TOKEN') {
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
        <p role="alert" style={{ color: 'var(--color-danger)', fontWeight: 500 }}>
          Ungültiger Moderatoren-Token. Bitte die Moderatoren-URL überprüfen.
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

  // ROOM_EXISTS is handled by useEffect above (auto-redirect); show nothing while redirecting
  if (connectionError?.code === 'ROOM_EXISTS') {
    return null;
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: 'var(--space-4)',
      }}
    >
      <TimerDisplay status={status} displayMs={displayMs} isWarning={isWarning} />

      <ConnectionIndicator status={connectionStatus} />

      <section aria-label="Zeitvorgaben" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <PresetButtons
          onSelect={handleSetDuration}
          selectedMs={selectedPreset}
          disabled={controlsDisabled || status === 'running'}
        />
        <CustomTimeInput
          onSubmit={handleSetDuration}
          disabled={controlsDisabled || status === 'running'}
        />
      </section>

      <TimerControls
        status={status}
        totalDurationMs={totalDurationMs}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        disabled={controlsDisabled}
      />

      <ShareSection
        sessionId={sessionId}
        modToken={modToken}
        initiallyOpen={isNewSession}
      />
    </main>
  );
}
