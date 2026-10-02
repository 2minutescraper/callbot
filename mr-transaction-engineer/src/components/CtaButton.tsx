'use client';
import { useRef, type ReactNode } from 'react';
import { journey } from '@/lib/store';
import { REGISTER_URL } from '@/lib/content';

/** Registration link with a very slight magnetic pull (disabled on touch / reduced motion). */
export function CtaButton({ children, variant = 'primary', className = '', label }: { children: ReactNode; variant?: 'primary' | 'ghost'; className?: string; label?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || journey.reduced || journey.mobile || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.12}px, ${(e.clientY - (r.top + r.height / 2)) * 0.2}px)`;
  };
  return (
    <a
      ref={ref}
      href={REGISTER_URL}
      className={`cta cta-${variant} ${className}`}
      aria-label={label}
      onPointerMove={move}
      onPointerLeave={() => { if (ref.current) ref.current.style.transform = ''; }}
    >
      {children}
    </a>
  );
}
