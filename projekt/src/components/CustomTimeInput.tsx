import { useState, useEffect, useId } from 'react';

interface CustomTimeInputProps {
  onSubmit: (ms: number) => void;
  disabled?: boolean;
  resetTrigger?: number;
}

// BUG-FEAT2-UX-003: track which field caused the error for per-field aria-invalid
type ErrorField = 'seconds' | 'both' | null;

export default function CustomTimeInput({ onSubmit, disabled, resetTrigger }: CustomTimeInputProps) {
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const id = useId();

  // BUG-FEAT2-UX-012: reset fields when a preset was selected externally
  useEffect(() => {
    if (resetTrigger === undefined || resetTrigger === 0) return;
    setMinutes('');
    setSeconds('');
    setError(null);
    setErrorField(null);
  }, [resetTrigger]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorField(null);

    const mins = parseInt(minutes || '0', 10);
    const secs = parseInt(seconds || '0', 10);

    if (isNaN(mins) || isNaN(secs)) {
      setError('Bitte gültige Zahlen eingeben.');
      setErrorField('both');
      return;
    }

    // BUG-FEAT2-QA-004: check seconds range before computing total (removes dead code)
    if (secs > 59) {
      setError('Sekunden müssen zwischen 0 und 59 liegen.');
      setErrorField('seconds');
      return;
    }

    const totalMs = (mins * 60 + secs) * 1000;

    if (totalMs < 1000) {
      setError('Mindestdauer: 1 Sekunde.');
      setErrorField('both');
      return;
    }

    if (totalMs > 5_999_000) {
      setError('Maximaldauer: 99:59.');
      setErrorField('both');
      return;
    }

    setMinutes('');
    setSeconds('');
    onSubmit(totalMs);
  }

  const errorId = `${id}-error`;
  const minsHasError = errorField === 'both';
  const secsHasError = errorField === 'seconds' || errorField === 'both';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label
            htmlFor={`${id}-min`}
            style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}
          >
            Min
          </label>
          <input
            id={`${id}-min`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={minutes}
            onChange={(e) => {
              setMinutes(e.target.value.replace(/\D/g, '').slice(0, 2));
              setError(null);
              setErrorField(null);
            }}
            placeholder="0"
            disabled={disabled}
            aria-describedby={minsHasError ? errorId : undefined}
            aria-invalid={minsHasError ? 'true' : undefined}
            style={{
              width: '64px',
              height: '44px',
              padding: '0 var(--space-3)',
              border: `1px solid ${minsHasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '16px',
              textAlign: 'center',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              transition: 'border-color var(--transition-fast)',
            }}
          />
        </div>

        <span
          aria-hidden="true"
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            paddingBottom: '10px',
          }}
        >
          :
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label
            htmlFor={`${id}-sec`}
            style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}
          >
            Sek
          </label>
          <input
            id={`${id}-sec`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={seconds}
            onChange={(e) => {
              setSeconds(e.target.value.replace(/\D/g, '').slice(0, 2));
              setError(null);
              setErrorField(null);
            }}
            placeholder="00"
            disabled={disabled}
            aria-describedby={secsHasError ? errorId : undefined}
            aria-invalid={secsHasError ? 'true' : undefined}
            style={{
              width: '64px',
              height: '44px',
              padding: '0 var(--space-3)',
              border: `1px solid ${secsHasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '16px',
              textAlign: 'center',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              transition: 'border-color var(--transition-fast)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          aria-label="Individuelle Zeit übernehmen"
          style={{
            height: '44px',
            padding: '0 var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'background var(--transition-fast)',
          }}
        >
          Übernehmen
        </button>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            marginTop: 'var(--space-2)',
            fontSize: '13px',
            color: 'var(--color-danger)',
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
