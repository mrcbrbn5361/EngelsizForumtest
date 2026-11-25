'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface SwitchRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * Labelled on/off switch row (role="switch") used on the preferences page.
 */
export function SwitchRow({ title, description, checked, onChange, disabled, icon }: SwitchRowProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-md border border-line bg-surface">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="mt-0.5 text-indigo-400 light:text-indigo-700 shrink-0" aria-hidden="true">{icon}</span>}
        <div className="min-w-0">
          <span id={`${id}-title`} className="block text-sm font-bold text-fg">{title}</span>
          {description && <span id={`${id}-desc`} className="block text-xs text-fg-4 mt-0.5">{description}</span>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
          checked ? 'bg-indigo-600 border-indigo-600' : 'bg-surface-hover border-line-strong'
        )}
      >
        <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0')} />
        <span className="sr-only">{checked ? 'Açık' : 'Kapalı'}</span>
      </button>
    </div>
  );
}
