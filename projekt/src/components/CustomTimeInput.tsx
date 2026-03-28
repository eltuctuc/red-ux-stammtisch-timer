import { useState, useId } from 'react';

interface CustomTimeInputProps {
  onSubmit: (ms: number) => void;
  disabled?: boolean;
}

export default function CustomTimeInput({ onSubmit, disabled }: CustomTimeInputProps) {
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const mins = parseInt(minutes || '0', 10);
    const secs = parseInt(seconds || '0', 10);

    if (isNaN(mins) || isNaN(secs)) {
      setError('Bitte gültige Zahlen eingeben.');
      return;
    }

    const totalMs = (mins * 60 + secs) * 1000;

    if (totalMs < 1000) {
      setError('Mindestdauer: 1 Sekunde.');
      return;
    }

    if (mins > 99 || (mins === 99 && secs > 59)) {
      setError('Maximaldauer: 99:59.');
      return;
    }

    if (secs < 0 || secs > 59) {
      setError('Sekunden müssen zwischen 0 und 59 liegen.');
      return;
    }

    setMinutes('');
    setSeconds('');
    onSubmit(totalMs);
  }

  const errorId = `${id}-error`;

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
            }}
            placeholder="0"
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : undefined}
            style={{
              width: '64px',
              height: '44px',
              padding: '0 var(--space-3)',
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
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
            }}
            placeholder="00"
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : undefined}
            style={{
              width: '64px',
              height: '44px',
              padding: '0 var(--space-3)',
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
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
