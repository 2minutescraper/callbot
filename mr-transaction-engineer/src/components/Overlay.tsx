'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { journey } from '@/lib/store';
import { BEATS, CHAPTERS, FINAL_FROM, chapterAt } from '@/lib/journey';
import { CTA } from '@/lib/content';
import { ASSETS } from '@/lib/content';
import { smooth } from './three-kit';
import { CtaButton } from './CtaButton';

/** Scroll-staged information: each beat fades in/out against the master timeline. */
export function Overlay() {
  const beats = useRef<(HTMLDivElement | null)[]>([]);
  const final = useRef<HTMLDivElement>(null);
  const chap = useRef<HTMLSpanElement>(null);
  const rail = useRef<(HTMLLIElement | null)[]>([]);
  const lastChap = useRef(-1);

  useEffect(() => {
    const tick = () => {
      const s = journey.s;
      BEATS.forEach((b, i) => {
        const el = beats.current[i]; if (!el) return;
        const o = smooth(b.s0, b.s0 + 0.07, s) * (1 - smooth(b.s1 - 0.07, b.s1, s));
        el.style.opacity = String(o);
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        el.style.transform = `translate3d(0, ${(1 - o) * 14}px, 0)`;
      });
      const f = smooth(FINAL_FROM, FINAL_FROM + 0.03, s);
      if (final.current) {
        final.current.style.opacity = String(f);
        final.current.style.visibility = f < 0.01 ? 'hidden' : 'visible';
        final.current.style.pointerEvents = f > 0.5 ? 'auto' : 'none';
      }
      const c = chapterAt(s);
      if (c !== lastChap.current) {
        lastChap.current = c;
        if (chap.current) chap.current.textContent = `${CHAPTERS[c].n} — ${CHAPTERS[c].name}`;
        rail.current.forEach((li, i) => li?.classList.toggle('on', i === c));
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <>
      <div className="beats" aria-hidden="true">
        {BEATS.map((b, i) => (
          <div key={b.id} ref={(el) => { beats.current[i] = el; }} className={`beat a-${b.align ?? 'center'} z-${b.size ?? 'md'}`} style={{ opacity: 0, visibility: 'hidden' }}>
            {b.tag && <span className="beat-tag">{b.tag}</span>}
            {b.lines.map((l) => <span key={l} className="beat-line">{l}</span>)}
            {b.list && <ul className="beat-list">{b.list.map((x) => <li key={x}>{x}</li>)}</ul>}
            {b.sub && <span className="beat-sub">{b.sub}</span>}
          </div>
        ))}
      </div>

      <div className="chapter-now" aria-hidden="true"><span ref={chap} /></div>

      <ol className="rail" aria-label="Journey chapters">
        {CHAPTERS.map((c, i) => (
          <li key={c.n} ref={(el) => { rail.current[i] = el; }}>
            <button data-goto={c.from} aria-label={`Go to chapter ${c.n}: ${c.name}`}><i />{c.n}</button>
          </li>
        ))}
      </ol>

      <div ref={final} className="final" style={{ opacity: 0, visibility: 'hidden' }}>
        <div className="final-inner">
          <p className="eyebrow">FREE 3-DAY VIRTUAL SUMMIT</p>
          <h2 className="final-h">LEARN THE 9 REAL ESTATE STRATEGIES<br />THAT CAN CHANGE HOW YOU SEE DEALS.</h2>
          <p className="final-p">Join the free 3-day Transaction Engineer Creative Strategy Summit and learn the strategies, deal structures, tools, and implementation framework taught by Eddie Raymond.</p>
          <div className="final-actions">
            <CtaButton className="cta-lg">{CTA.primaryFree}</CtaButton>
            <CtaButton variant="ghost">{CTA.secondary}</CtaButton>
          </div>
          {ASSETS.eddiePhoto && <img className="final-photo" src={ASSETS.eddiePhoto} alt={ASSETS.eddieAlt} />}
          <a className="final-more" href="#details">Details, FAQ &amp; disclaimer ↓</a>
        </div>
      </div>
    </>
  );
}
