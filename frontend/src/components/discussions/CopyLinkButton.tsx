'use client';

import { Check, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard?.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-[11px] text-[13.5px] font-medium text-ink-2 hover:bg-fill hover:text-ink [&>svg]:size-4"
    >
      {copied ? <Check aria-hidden /> : <LinkIcon aria-hidden />}
      <span aria-live="polite">{copied ? 'Lien copié' : 'Copier le lien'}</span>
    </button>
  );
}
