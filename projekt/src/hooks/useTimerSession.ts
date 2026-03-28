import { useEffect, useRef, useState, useCallback } from 'react';
import PartySocket from 'partysocket';
import type { TimerState } from '../lib/timerTypes';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface TimerSessionState {
  timerState: (TimerState & { displayRemainingMs: number; isWarning: boolean }) | null;
  connectionStatus: ConnectionStatus;
  sessionExpired: boolean;
  connectionError: { code: string } | null;
  sendCommand: (cmd: object) => void;
}

function playExpireSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 1.5); // C4
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.5);
  } catch {
    // Browser-Policy kann AudioContext blockieren – Timer läuft trotzdem weiter
  }
}

export function useTimerSession({
  sessionId,
  modToken,
}: {
  sessionId: string;
  modToken?: string;
}): TimerSessionState {
  const [serverState, setServerState] = useState<TimerState | null>(null);
  const [displayRemainingMs, setDisplayRemainingMs] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [connectionError, setConnectionError] = useState<{ code: string } | null>(null);

  const socketRef = useRef<PartySocket | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevStatusRef = useRef<TimerState['status'] | null>(null);
  const serverStateRef = useRef<TimerState | null>(null);

  // Keep ref in sync for use inside rAF callback
  serverStateRef.current = serverState;

  // Animate displayRemainingMs via rAF when running
  useEffect(() => {
    function tick() {
      const state = serverStateRef.current;
      if (!state) return;

      if (state.status === 'running' && state.startedAt !== null) {
        const computed = Math.max(0, state.remainingMs - (Date.now() - state.startedAt));
        setDisplayRemainingMs(computed);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayRemainingMs(state.remainingMs);
      }
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    if (serverState?.status === 'running') {
      rafRef.current = requestAnimationFrame(tick);
    } else if (serverState) {
      setDisplayRemainingMs(serverState.remainingMs);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [serverState]);

  // Sound on running → expired transition
  useEffect(() => {
    if (!serverState) return;

    const prev = prevStatusRef.current;
    const curr = serverState.status;

    if (prev === 'running' && curr === 'expired') {
      playExpireSound();
    }

    prevStatusRef.current = curr;
  }, [serverState]);

  // WebSocket connection
  useEffect(() => {
    const query: Record<string, string> = {};
    if (modToken) {
      query.mod = modToken;
    }

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: sessionId,
      query,
    });

    socketRef.current = socket;
    setConnectionStatus('connecting');

    socket.addEventListener('open', () => {
      setConnectionStatus('connected');
    });

    socket.addEventListener('close', () => {
      setConnectionStatus('disconnected');
    });

    socket.addEventListener('error', () => {
      setConnectionStatus('error');
    });

    socket.addEventListener('message', (event: MessageEvent) => {
      let msg: { type: string; timer?: TimerState; code?: string };
      try {
        msg = JSON.parse(event.data as string) as {
          type: string;
          timer?: TimerState;
          code?: string;
        };
      } catch {
        return;
      }

      if (msg.type === 'STATE_UPDATE' && msg.timer) {
        setServerState(msg.timer);
        setConnectionStatus('connected');
      } else if (msg.type === 'SESSION_EXPIRED') {
        setSessionExpired(true);
      } else if (msg.type === 'ERROR') {
        setConnectionError({ code: msg.code ?? 'UNKNOWN' });
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [sessionId, modToken]);

  const sendCommand = useCallback((cmd: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(cmd));
    }
  }, []);

  // Derived state
  const isWarning =
    serverState !== null &&
    serverState.totalDurationMs > 0 &&
    serverState.status !== 'idle' &&
    serverState.status !== 'expired' &&
    displayRemainingMs <= serverState.totalDurationMs * 0.2;

  const timerState =
    serverState !== null
      ? { ...serverState, displayRemainingMs, isWarning }
      : null;

  return {
    timerState,
    connectionStatus,
    sessionExpired,
    connectionError,
    sendCommand,
  };
}
