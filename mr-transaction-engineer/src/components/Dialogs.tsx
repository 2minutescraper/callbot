'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { RESOURCES, STRATEGIES } from '@/lib/content';
import { CtaButton } from './CtaButton';

function Shell({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prev = useRef<Element | null>(null);
  useEffect(() => {
    prev.current = document.activeElement; closeRef.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); (prev.current as HTMLElement | null)?.focus?.(); };
  }, [onClose]);
  return (
    <div className="dialog-wrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={label}>
        <button ref={closeRef} className="dialog-x" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}

export function StrategyDialog({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: number) => void }) {
  const s = STRATEGIES[index];
  return (
    <Shell label={`${s.name} strategy`} onClose={onClose}>
      <p className="eyebrow">STRATEGY {String(s.n).padStart(2, '0')} / 09</p>
      <h2 className="dialog-title">{s.name}</h2>
      <dl className="dl">
        <dt>What it is</dt><dd>{s.what}</dd>
        <dt>May be useful for</dt><dd>{s.useful}</dd>
        <dt>In the summit</dt><dd>{s.learn}</dd>
      </dl>
      <p className="fine">Educational overview. Not every strategy fits every property or person, and results are never guaranteed.</p>
      <div className="dialog-actions">
        <button className="cta cta-ghost" onClick={() => onStep(-1)} aria-label="Previous strategy">←</button>
        <button className="cta cta-ghost" onClick={() => onStep(1)} aria-label="Next strategy">→</button>
        <CtaButton>LEARN MORE — SAVE MY SEAT</CtaButton>
      </div>
    </Shell>
  );
}

export function ResourceDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const r = RESOURCES.find((x) => x.id === id)!;
  return (
    <Shell label={r.title} onClose={onClose}>
      <p className="eyebrow">INCLUDED WITH SUMMIT REGISTRATION</p>
      <h2 className="dialog-title">{r.title}</h2>
      <p className="dialog-body">{r.body}</p>
      {/* TODO(approved): drop approved screenshots / video / document previews here. */}
      <div className="dialog-actions"><CtaButton>SAVE MY SEAT — FREE</CtaButton></div>
    </Shell>
  );
}
