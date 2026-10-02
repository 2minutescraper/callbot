'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { journey } from '@/lib/store';
import { END_HOLD, LAST, ST, progressToS, sToProgress } from '@/lib/journey';
import { CTA, STRATEGIES } from '@/lib/content';
import { CtaButton } from './CtaButton';
import { Loader } from './Loader';
import { Overlay } from './Overlay';
import { ResourceDialog, StrategyDialog } from './Dialogs';

const Scene = dynamic(() => import('./Scene'), { ssr: false });
gsap.registerPlugin(ScrollTrigger);

const MENU = [
  { label: 'HOME', s: 0 }, { label: 'STRATEGIES', s: ST.engine }, { label: 'SUMMIT', s: ST.day1 }, { label: 'ABOUT', s: ST.eddie },
];

export default function Experience() {
  const section = useRef<HTMLElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [menu, setMenu] = useState(false);
  const [strategy, setStrategy] = useState<number | null>(null);
  const [resource, setResource] = useState<string | null>(null);

  // environment detection (must precede Scene mount: mobile simplification is decided at construction)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mob = window.matchMedia('(max-width: 820px), (pointer: coarse)');
    journey.reduced = mq.matches; journey.mobile = mob.matches; setReduced(mq.matches);
    try { const c = document.createElement('canvas'); if (!(c.getContext('webgl2') || c.getContext('webgl'))) setWebgl(false); } catch { setWebgl(false); }
    // warm the 3D typography before the camera needs it
    Promise.all(['/fonts/inter-800.ttf', '/fonts/inter-500.ttf'].map((u) => fetch(u))).catch(() => {});
    (window as unknown as { __journey: typeof journey }).__journey = journey;
    setMounted(true);
  }, []);

  useEffect(() => { journey.reduced = reduced; }, [reduced]);

  // master timeline: Lenis (smooth scroll) → GSAP ScrollTrigger (progress) → damped camera progress
  useEffect(() => {
    if (!mounted) return;
    const el = section.current!;
    let l: Lenis | null = null;
    if (!reduced) {
      l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.85 });
      lenis.current = l;
      l.on('scroll', ScrollTrigger.update);
    }
    const raf = (t: number) => l?.raf(t * 1000);
    gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
    const damp = (_t: number, dt: number) => {
      const k = reduced ? 1 : 1 - Math.exp(-(dt / 1000) * 5);
      journey.s += (journey.target - journey.s) * k;
      if (Math.abs(journey.target - journey.s) < 0.0005) journey.s = journey.target;
    };
    gsap.ticker.add(damp);
    const st = ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { journey.target = progressToS(self.progress); } });
    return () => { st.kill(); gsap.ticker.remove(raf); gsap.ticker.remove(damp); l?.destroy(); lenis.current = null; };
  }, [mounted, reduced]);

  const goTo = useCallback((s: number) => {
    const el = section.current; if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + sToProgress(Math.min(LAST, s)) * (el.offsetHeight - window.innerHeight);
    if (lenis.current) lenis.current.scrollTo(y, { duration: 2.2 }); else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }, [reduced]);

  // chapter rail + menu use data-goto; HTML strategy list dispatches te:strategy
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest('[data-goto]') as HTMLElement | null;
      if (t) { e.preventDefault(); setMenu(false); goTo(Number(t.dataset.goto)); }
    };
    const open = (e: Event) => { openStrategy((e as CustomEvent<number>).detail, false); };
    document.addEventListener('click', click); window.addEventListener('te:strategy', open);
    return () => { document.removeEventListener('click', click); window.removeEventListener('te:strategy', open); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goTo]);

  const lock = (on: boolean) => { if (on) lenis.current?.stop(); else lenis.current?.start(); };
  const openStrategy = (i: number, fromJourney = true) => {
    const near = fromJourney && Math.abs(journey.s - ST.engine) < 1.3;
    journey.focus = near ? i : null; setStrategy(i); lock(true);
  };
  const closeStrategy = useCallback(() => { journey.focus = null; setStrategy(null); lock(false); }, []);
  const step = (d: number) => setStrategy((cur) => {
    const n = ((cur ?? 0) + d + STRATEGIES.length) % STRATEGIES.length;
    if (journey.focus !== null) journey.focus = n;
    return n;
  });
  const openResource = (id: string) => { setResource(id); lock(true); };
  const closeResource = useCallback(() => { setResource(null); lock(false); }, []);

  const perSeg = mounted && journey.mobile ? 95 : 120;
  const height = `${Math.round(LAST * (1 + END_HOLD) * perSeg) + 100}vh`;

  return (
    <>
      <a className="skip" href="#details">Skip the 3D journey to the details</a>
      <header className="hdr">
        <a className="brand" href="#" data-goto="0" aria-label="Mr. Transaction Engineer — home">MR. <b>TRANSACTION</b> ENGINEER</a>
        <div className="hdr-right">
          <button className="pill" onClick={() => setReduced((r) => !r)} aria-pressed={reduced} title="Turn smooth camera motion off">{reduced ? 'MOTION: OFF' : 'MOTION: ON'}</button>
          <button className="pill" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="menu">MENU</button>
          <CtaButton className="hdr-cta">{CTA.primary}</CtaButton>
        </div>
      </header>
      {menu && (
        <nav id="menu" className="menu" aria-label="Site">
          {MENU.map((m) => <a key={m.label} href="#" data-goto={m.s}>{m.label}</a>)}
          <a href="#details" onClick={() => setMenu(false)}>DETAILS &amp; FAQ</a>
          <CtaButton>{CTA.primary}</CtaButton>
        </nav>
      )}

      <section ref={section} id="journey" className="journey" style={{ height }} aria-label="Cinematic journey">
        <div className="stage">
          {mounted && webgl && <Scene onStrategy={(i) => openStrategy(i)} onResource={openResource} onReady={() => setSceneReady(true)} />}
          {mounted && !webgl && <div className="nowebgl">The interactive 3D journey needs WebGL. All of the content is available below.</div>}
          <div className="vignette" aria-hidden="true" />
          <Overlay />
          <div className="scroll-hint" aria-hidden="true">SCROLL</div>
        </div>
      </section>

      <div className="mobile-cta"><CtaButton>{CTA.primaryFree}</CtaButton></div>
      {strategy !== null && <StrategyDialog index={strategy} onClose={closeStrategy} onStep={step} />}
      {resource && <ResourceDialog id={resource} onClose={closeResource} />}
      {!loaded && <Loader ready={sceneReady || (mounted && !webgl)} onDone={() => setLoaded(true)} />}
    </>
  );
}
