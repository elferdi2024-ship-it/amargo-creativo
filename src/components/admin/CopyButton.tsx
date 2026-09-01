// filepath: src/components/admin/CopyButton.tsx
import { useState } from "react";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = "Copiar link", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn-copy ${copied ? "copied" : ""} ${className}`}
      title="Copiar al portapapeles"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {copied ? (
          <polyline points="20 6 9 17 4 12"></polyline>
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </>
        )}
      </svg>
      <span>{copied ? "¡Copiado!" : label}</span>

      <style>{`
        .btn-copy {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--adm-border, #24352A);
          color: var(--adm-ink, #F4F6F2);
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-copy:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--adm-lime, #C8FF00);
        }

        .btn-copy.copied {
          background: rgba(200, 255, 0, 0.2);
          border-color: var(--adm-lime, #C8FF00);
          color: var(--adm-lime, #C8FF00);
        }
      `}</style>
    </button>
  );
}
