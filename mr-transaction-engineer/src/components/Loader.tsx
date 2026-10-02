'use client';
import { useEffect, useState } from 'react';

/** Premium loading screen: INITIALIZING / TRANSACTION ENGINE → FIND THE DEAL. → fade into the lab. */
export function Loader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<'load' | 'find' | 'out' | 'gone'>('load');
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPct((p) => Math.min(ready ? 100 : 88, p + Math.max(0.4, (100 - p) * 0.035)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);
  useEffect(() => { if (ready && pct >= 99.5 && phase === 'load') setPhase('find'); }, [ready, pct, phase]);
  useEffect(() => {
    if (phase === 'find') { const t = setTimeout(() => setPhase('out'), 1100); return () => clearTimeout(t); }
    if (phase === 'out') { const t = setTimeout(() => { setPhase('gone'); onDone(); }, 900); return () => clearTimeout(t); }
  }, [phase, onDone]);
  if (phase === 'gone') return null;
  return (
    <div className={`loader ${phase === 'out' ? 'loader-out' : ''}`} role="status" aria-live="polite">
      {phase === 'load' ? (
        <>
          <p className="loader-kicker">INITIALIZING</p>
          <p className="loader-title">TRANSACTION ENGINE</p>
          <p className="loader-pct" aria-label={`${Math.round(pct)} percent`}>{String(Math.round(pct)).padStart(3, '0')}</p>
          <span className="loader-bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
        </>
      ) : (
        <p className="loader-title loader-find">FIND THE DEAL.</p>
      )}
    </div>
  );
}
