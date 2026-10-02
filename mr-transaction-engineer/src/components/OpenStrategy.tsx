'use client';
export function OpenStrategy({ index, name }: { index: number; name: string }) {
  return (
    <button className="cta cta-ghost small" onClick={() => window.dispatchEvent(new CustomEvent('te:strategy', { detail: index }))} aria-label={`Open ${name} overview`}>
      Open overview
    </button>
  );
}
