import { useState } from 'react';

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

export default function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await copyToClipboard(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard-Zugriff verweigert – still fail
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? 'In Zwischenablage kopiert' : label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        minHeight: '44px',
        padding: '0 var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        background: copied ? 'var(--color-success)' : 'var(--color-surface)',
        color: copied ? 'white' : 'var(--color-text-primary)',
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
      <span aria-hidden="true">{copied ? '✓' : '⎘'}</span>
      {copied ? 'Kopiert!' : label}
    </button>
  );
}
