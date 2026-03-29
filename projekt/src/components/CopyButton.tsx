import { useState, useRef, useEffect } from 'react';

interface CopyButtonProps {
  value: string;
  label: string;
  describedBy?: string;
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback für ältere Browser
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function CopyButton({ value, label, describedBy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleClick() {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    try {
      await copyToClipboard(value);
      setCopyError(false);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      timeoutRef.current = setTimeout(() => setCopyError(false), 3000);
    }
  }

  const bg = copied ? 'var(--color-success)' : 'var(--color-surface)';
  const color = copied ? 'white' : 'var(--color-text-primary)';
  const currentLabel = copied ? 'Kopiert!' : label;
  const ariaLabel = copied
    ? 'In Zwischenablage kopiert'
    : copyError
    ? 'Kopieren fehlgeschlagen'
    : label;

  // BUG-FEAT1-UX-017: error text rendered below button (not inside) to prevent layout shift
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {/* BUG-FEAT1-UX-026: visually hidden live region so screen readers announce copy success */}
      <span
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
      >
        {copied ? 'In Zwischenablage kopiert' : ''}
      </span>
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          minHeight: '44px',
          padding: '0 var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: bg,
          color: color,
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background var(--transition-fast), color var(--transition-fast)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {copied ? <IconCheck /> : <IconCopy />}
        {currentLabel}
      </button>
      {copyError && (
        <p
          role="alert"
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--color-danger)',
          }}
        >
          Nicht kopiert – bitte manuell kopieren
        </p>
      )}
    </div>
  );
}
