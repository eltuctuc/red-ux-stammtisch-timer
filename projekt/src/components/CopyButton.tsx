import { useState, useRef, useEffect } from 'react';

interface CopyButtonProps {
  value: string;
  label: string;
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

export default function CopyButton({ value, label }: CopyButtonProps) {
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

  const bg = copyError
    ? 'var(--color-danger)'
    : copied
    ? 'var(--color-success)'
    : 'var(--color-surface)';
  const color = copied || copyError ? 'white' : 'var(--color-text-primary)';
  const currentLabel = copyError
    ? 'Nicht kopiert – bitte manuell kopieren'
    : copied
    ? 'Kopiert!'
    : label;
  const ariaLabel = copied
    ? 'In Zwischenablage kopiert'
    : copyError
    ? 'Kopieren fehlgeschlagen'
    : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
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
        whiteSpace: copyError ? 'normal' : 'nowrap',
        overflow: copyError ? 'visible' : 'hidden',
        textOverflow: copyError ? 'unset' : 'ellipsis',
        maxWidth: '100%',
      }}
    >
      {copied ? <IconCheck /> : <IconCopy />}
      {currentLabel}
    </button>
  );
}
