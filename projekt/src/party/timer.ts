import type * as Party from 'partykit/server';
import type { TimerState } from '../lib/timerTypes';

export type { TimerState };

interface SessionState {
  modToken: string | null;
  timer: TimerState;
  lastActivityAt: number;
  alarmType: 'timer' | 'session';
}

function defaultTimerState(): TimerState {
  return {
    status: 'idle',
    totalDurationMs: 0,
    remainingMs: 0,
    startedAt: null,
  };
}

export default class TimerServer implements Party.Server {
  private state: SessionState;
  // Tracks connection IDs of verified moderators
  private modConnections: Set<string> = new Set();

  constructor(readonly room: Party.Room) {
    this.state = {
      modToken: null,
      timer: defaultTimerState(),
      lastActivityAt: Date.now(),
      alarmType: 'session',
    };
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Bug fix BUG-FEAT1-QA-010: reject connections to expired sessions
    const isExpired = await this.room.storage.get<boolean>('expired');
    if (isExpired) {
      conn.send(JSON.stringify({ type: 'ERROR', code: 'SESSION_NOT_FOUND' }));
      conn.close();
      return;
    }

    // BUG-FEAT1-QA-020: restore persisted modToken after DO restart (survives hibernation/deployment)
    if (this.state.modToken === null) {
      const storedToken = await this.room.storage.get<string>('modToken');
      if (storedToken) this.state.modToken = storedToken;
    }

    const url = new URL(ctx.request.url);
    const tokenParam = url.searchParams.get('mod');
    // BUG-FEAT1-QA-014: distinguish new-session creation from reconnect
    const isNewSession = url.searchParams.get('new') === '1';

    if (tokenParam) {
      if (this.state.modToken === null) {
        // First moderator connects – claim the token
        this.state.modToken = tokenParam;
        // BUG-FEAT1-QA-020: persist modToken so it survives DO restarts
        await this.room.storage.put('modToken', tokenParam);
        this.modConnections.add(conn.id);
        // Bug fix BUG-FEAT1-QA-008: set session-expiry alarm on initial creation
        await this.room.storage.setAlarm(Date.now() + 3 * 60 * 60 * 1_000);
        this.state.alarmType = 'session';
      } else if (tokenParam === this.state.modToken) {
        // Returning moderator with correct token
        this.modConnections.add(conn.id);
      } else if (isNewSession) {
        // BUG-FEAT1-QA-014: ID collision – room already owned, client should retry with new ID
        conn.send(JSON.stringify({ type: 'ERROR', code: 'ROOM_EXISTS' }));
        conn.close(); // BUG-FEAT1-QA-016
        return;
      } else {
        // Invalid token on reconnect attempt
        conn.send(JSON.stringify({ type: 'ERROR', code: 'INVALID_TOKEN' }));
        conn.close(); // BUG-FEAT1-QA-016
        return;
      }
    } else {
      // Participant connecting – room must already be owned by a moderator
      if (this.state.modToken === null) {
        conn.send(JSON.stringify({ type: 'ERROR', code: 'SESSION_NOT_FOUND' }));
        conn.close(); // BUG-FEAT1-QA-016
        return;
      }
    }

    // Send current state to newly connected client
    conn.send(
      JSON.stringify({ type: 'STATE_UPDATE', timer: this.state.timer })
    );
  }

  onClose(conn: Party.Connection) {
    this.modConnections.delete(conn.id);
  }

  onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    // Only verified moderators may send commands
    if (!this.modConnections.has(sender.id)) {
      return;
    }

    // BUG-FEAT2-QA-005: reject non-string messages early instead of passing '' to JSON.parse
    if (typeof message !== 'string') return;

    let cmd: { type: string; durationMs?: number };
    try {
      cmd = JSON.parse(message) as {
        type: string;
        durationMs?: number;
      };
    } catch {
      return;
    }

    const timer = this.state.timer;

    switch (cmd.type) {
      case 'SET_DURATION': {
        // BUG-FEAT1-QA-019: reject non-finite values (NaN, Infinity, strings) before clamping
        const raw = typeof cmd.durationMs === 'number' && Number.isFinite(cmd.durationMs)
          ? cmd.durationMs
          : 0;
        // Clamp to [1000, 5_999_000] ms (1s – 99:59)
        const durationMs = Math.min(5_999_000, Math.max(1_000, raw));
        this.state.timer = {
          status: 'idle',
          totalDurationMs: durationMs,
          remainingMs: durationMs,
          startedAt: null,
        };
        break;
      }

      case 'START': {
        if (timer.status !== 'idle' && timer.status !== 'expired') return;
        // BUG-FEAT2-QA-006: reject start without a duration set
        if (timer.totalDurationMs === 0) return;
        const now = Date.now();
        // BUG-FEAT2-QA-013: when restarting from expired, remainingMs is 0 – reset to totalDurationMs
        const startingRemainingMs = timer.status === 'expired' ? timer.totalDurationMs : timer.remainingMs;
        this.state.timer = {
          ...timer,
          status: 'running',
          remainingMs: startingRemainingMs,
          startedAt: now,
        };
        this.state.lastActivityAt = now;
        void this.room.storage.setAlarm(now + startingRemainingMs);
        this.state.alarmType = 'timer';
        break;
      }

      case 'PAUSE': {
        if (timer.status !== 'running') return;
        const elapsed = timer.startedAt ? Date.now() - timer.startedAt : 0;
        const remaining = Math.max(0, timer.remainingMs - elapsed);
        this.state.timer = {
          ...timer,
          status: 'paused',
          remainingMs: remaining,
          startedAt: null,
        };
        // Switch to session-expiry alarm while paused
        void this.room.storage.setAlarm(Date.now() + 3 * 60 * 60 * 1_000);
        this.state.alarmType = 'session';
        break;
      }

      case 'RESUME': {
        if (timer.status !== 'paused') return;
        const now = Date.now();
        this.state.timer = {
          ...timer,
          status: 'running',
          startedAt: now,
        };
        // Resume timer-expiry alarm for remaining time
        void this.room.storage.setAlarm(now + timer.remainingMs);
        this.state.alarmType = 'timer';
        break;
      }

      case 'RESET': {
        this.state.timer = {
          ...timer,
          status: 'idle',
          remainingMs: timer.totalDurationMs,
          startedAt: null,
        };
        // Back to session-expiry alarm
        void this.room.storage.setAlarm(Date.now() + 3 * 60 * 60 * 1_000);
        this.state.alarmType = 'session';
        break;
      }

      default:
        // Unknown command – silently ignore
        return;
    }

    this.room.broadcast(
      JSON.stringify({ type: 'STATE_UPDATE', timer: this.state.timer })
    );
  }

  async onAlarm() {
    if (this.state.alarmType === 'timer') {
      // Timer has run out – broadcast expired state
      this.state.timer = {
        ...this.state.timer,
        status: 'expired',
        remainingMs: 0,
        startedAt: null,
      };
      this.room.broadcast(
        JSON.stringify({ type: 'STATE_UPDATE', timer: this.state.timer })
      );
      // Schedule session cleanup after 3 more hours of inactivity
      void this.room.storage.setAlarm(Date.now() + 3 * 60 * 60 * 1_000);
      this.state.alarmType = 'session';
    } else {
      // Session has been inactive for 3 hours – expire everything
      // Bug fix BUG-FEAT1-QA-010: persist expired flag before resetting state
      await this.room.storage.put('expired', true);
      this.room.broadcast(JSON.stringify({ type: 'SESSION_EXPIRED' }));
      for (const conn of this.room.getConnections()) {
        conn.close();
      }
    }
  }
}

TimerServer satisfies Party.Worker;
