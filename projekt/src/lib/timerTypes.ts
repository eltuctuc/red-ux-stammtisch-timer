/** Shared Timer-Typen – genutzt von Party-Server und Client-Code */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'expired';

export interface TimerState {
  status: TimerStatus;
  totalDurationMs: number;
  remainingMs: number;
  startedAt: number | null;
}
