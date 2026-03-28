const PRESETS = [
  { label: '2 Min', ms: 2 * 60 * 1000 },
  { label: '5 Min', ms: 5 * 60 * 1000 },
  { label: '10 Min', ms: 10 * 60 * 1000 },
  { label: '15 Min', ms: 15 * 60 * 1000 },
  { label: '30 Min', ms: 30 * 60 * 1000 },
];

interface PresetButtonsProps {
  onSelect: (ms: number) => void;
  selectedMs: number | null;
  disabled?: boolean;
}

export default function PresetButtons({ onSelect, selectedMs, disabled }: PresetButtonsProps) {
  return (
    <div
      role="group"
      aria-label="Zeitvorgaben"
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
      }}
    >
      {PRESETS.map(({ label, ms }) => {
        const isActive = selectedMs === ms;
        return (
          <button
            key={ms}
            type="button"
            onClick={() => onSelect(ms)}
            disabled={disabled}
            aria-pressed={isActive}
            style={{
              minHeight: '44px',
              padding: '0 var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
              color: isActive ? 'white' : 'var(--color-text-primary)',
              fontWeight: isActive ? 600 : 400,
              fontSize: '15px',
              transition: 'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
