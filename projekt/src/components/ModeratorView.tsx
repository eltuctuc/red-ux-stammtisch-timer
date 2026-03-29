import { useCallback, useEffect, useRef, useState } from 'react';
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
  isNew?: boolean; // BUG-FEAT1-QA-014
}

export default function ModeratorView({ sessionId, modToken, isNew }: ModeratorViewProps) {
  const navigate = useNavigate();
  const { timerState, connectionStatus, connectionError, sessionExpired, sendCommand } =
    useTimerSession({ sessionId, modToken, isNew }); // BUG-FEAT1-QA-014

  const roomExistsRetryCount = useRef<number>(0);
  // BUG-FEAT2-UX-012: counter incremented on preset selection so CustomTimeInput resets its fields
  const [presetResetKey, setPresetResetKey] = useState(0);
  // BUG-FEAT2-QA-008: compute initiallyOpen once after first timerState arrives,
  // using sessionStorage so the ShareSection only auto-opens once per browser session
  const shareInitiallyOpenRef = useRef<boolean | null>(null);

  // BUG-FEAT1-QA-015: All useEffects BEFORE any conditional returns
  // BUG-FEAT1-QA-017: clean up ?new=1 from URL once connection is established
  useEffect(() => {
    if (connectionStatus === 'connected' && isNew) {
      navigate(`/session/${sessionId}?mod=${modToken}`, { replace: true });
    }
  }, [connectionStatus, isNew, navigate, sessionId, modToken]);

  // Auto-retry with new session ID on collision (room already owned by someone else)
  // Max 3 retries to prevent infinite redirect loop (BUG-FEAT1-QA-006)
  useEffect(() => {
    if (connectionError?.code === 'ROOM_EXISTS') {
      if (roomExistsRetryCount.current < 3) {
        roomExistsRetryCount.current += 1;
        const newSessionId = generateSessionId();
        const newModToken = generateModToken();
        // BUG-FEAT1-QA-014: keep ?new=1 on retry so server still treats it as creation
        navigate(`/session/${newSessionId}?mod=${newModToken}&new=1`, { replace: true });
      } else {
        // BUG-FEAT1-UX-019: show error instead of silently navigating away
        navigate('/', {
          replace: true,
          state: { reconnectError: 'Konnte keine freie Session erstellen. Bitte versuche es erneut.' },
        });
      }
    }
  }, [connectionError, navigate]);

  // BUG-FEAT1-QA-015: moved before conditional return (was after if (sessionExpired) block)
  // INVALID_TOKEN: redirect back to LandingPage with inline error (spec: error stays on landing page)
  useEffect(() => {
    if (connectionError?.code === 'INVALID_TOKEN') {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const originalInput = `${origin}/session/${sessionId}?mod=${modToken}`;
      navigate('/', {
        replace: true,
        state: {
          reconnectError: 'Session nicht gefunden oder abgelaufen. Bitte überprüfe deine Moderatoren-URL.',
          input: originalInput,
        },
      });
    }
  }, [connectionError, navigate, sessionId, modToken]);

  const handleSetDuration = useCallback(
    (ms: number) => {
      sendCommand({ type: 'SET_DURATION', durationMs: ms });
    },
    [sendCommand]
  );

  // BUG-FEAT2-UX-012: separate handler for preset selection that also resets CustomTimeInput
  const handlePresetSelect = useCallback(
    (ms: number) => {
      handleSetDuration(ms);
      setPresetResetKey((k) => k + 1);
    },
    [handleSetDuration]
  );

  const handleStart = useCallback(() => sendCommand({ type: 'START' }), [sendCommand]);
  const handlePause = useCallback(() => sendCommand({ type: 'PAUSE' }), [sendCommand]);
  const handleResume = useCallback(() => sendCommand({ type: 'RESUME' }), [sendCommand]);
  const handleReset = useCallback(() => sendCommand({ type: 'RESET' }), [sendCommand]);

  const status = timerState?.status ?? 'idle';
  const totalDurationMs = timerState?.totalDurationMs ?? 0;
  const displayMs = connectionStatus === 'connecting' && !timerState
    ? null
    : (timerState?.displayRemainingMs ?? 0);
  const isWarning = timerState?.isWarning ?? false;

  // Preset ist aktiv wenn totalDurationMs genau einem Preset entspricht
  const presetValues = [2, 5, 10, 15, 30].map((m) => m * 60 * 1000);
  const selectedPreset = presetValues.includes(totalDurationMs) ? totalDurationMs : null;

  // BUG-FEAT2-QA-008: only open ShareSection once after first load, not on every reload
  if (shareInitiallyOpenRef.current === null && timerState !== null) {
    const key = `share-seen-${sessionId}`;
    if (!sessionStorage.getItem(key)) {
      shareInitiallyOpenRef.current = status === 'idle' && totalDurationMs === 0;
      sessionStorage.setItem(key, '1');
    } else {
      shareInitiallyOpenRef.current = false;
    }
  }
  const isNewSession = shareInitiallyOpenRef.current ?? false;

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

  // ROOM_EXISTS and INVALID_TOKEN are handled by useEffects above (auto-redirect)
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
          onSelect={handlePresetSelect}
          selectedMs={selectedPreset}
          disabled={controlsDisabled || status === 'running'}
        />
        {/* BUG-FEAT2-UX-005: explain why presets are disabled while timer is running */}
        {status === 'running' && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Timer pausieren um Dauer zu ändern
          </p>
        )}
        <CustomTimeInput
          onSubmit={handleSetDuration}
          disabled={controlsDisabled || status === 'running'}
          resetTrigger={presetResetKey}
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
