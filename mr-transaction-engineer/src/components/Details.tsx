import { CREDENTIALS, CREDENTIAL_LINES, CTA, DISCLAIMER, FAQ, FOOTER_LINKS, FOR_WHO, NOT_FOR, PROOF, RESOURCES, SITE, STRATEGIES, SUMMIT_DAYS } from '@/lib/content';
import { CtaButton } from './CtaButton';
import { OpenStrategy } from './OpenStrategy';

/** Real, crawlable HTML for everything the 3D journey communicates. The offer never depends on WebGL. */
export function Details() {
  return (
    <div id="details" className="details">
      <section className="wrap" aria-labelledby="h-summit">
        <p className="eyebrow">FREE · VIRTUAL · 3 DAYS</p>
        <h2 id="h-summit">The Transaction Engineer Creative Strategy Summit</h2>
        <p className="lead">A free 3-day virtual summit on creative real estate strategies, deal finding, deal structuring, fast cash and long-term wealth building, taught by {SITE.person}.</p>
        <div className="grid3">
          {SUMMIT_DAYS.map((d) => (
            <article key={d.day} className="card">
              <p className="eyebrow">DAY {d.day}</p>
              <h3>{d.title}</h3>
              <ul>{d.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="center"><CtaButton className="cta-lg">{CTA.primaryFree}</CtaButton></div>
      </section>

      <section className="wrap" aria-labelledby="h-strat">
        <p className="eyebrow">THE 9-STRATEGY BLUEPRINT</p>
        <h2 id="h-strat">9 creative real estate strategies. Multiple ways to approach a transaction.</h2>
        <div className="grid3">
          {STRATEGIES.map((s, i) => (
            <article key={s.id} className="card">
              <p className="eyebrow">{String(s.n).padStart(2, '0')}</p>
              <h3>{s.name}</h3>
              <p>{s.what}</p>
              <OpenStrategy index={i} name={s.name} />
            </article>
          ))}
        </div>
      </section>

      <section className="wrap" aria-labelledby="h-incl">
        <p className="eyebrow">INCLUDED WITH REGISTRATION</p>
        <h2 id="h-incl">Tools and implementation resources</h2>
        <div className="grid3">
          {RESOURCES.map((r) => (<article key={r.id} className="card"><h3>{r.title}</h3><p>{r.body}</p></article>))}
        </div>
      </section>

      <section className="wrap two" aria-labelledby="h-who">
        <div>
          <h2 id="h-who">Who this is for</h2>
          <ul className="ticks">{FOR_WHO.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
        <div>
          <h2>Who this is not for</h2>
          <p className="lead">This is not a get-rich-quick system. The summit is not for people seeking get-rich-quick schemes, unwilling to take action, or looking for theory rather than real-world strategies.</p>
          <ul className="crosses">{NOT_FOR.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
      </section>

      <section id="about" className="wrap" aria-labelledby="h-eddie">
        <p className="eyebrow">YOUR INSTRUCTOR</p>
        <h2 id="h-eddie">{SITE.person}, “Mr. Transaction Engineer”</h2>
        <div className="stats">{CREDENTIALS.map((c) => (<div key={c.big}><b>{c.big}</b><span>{c.label}</span></div>))}</div>
        <ul className="ticks">{CREDENTIAL_LINES.map((l) => <li key={l}>{l}</li>)}</ul>
      </section>

      {PROOF.length > 0 && (
        <section className="wrap" aria-labelledby="h-proof">
          <h2 id="h-proof">Proof &amp; experience</h2>
          <div className="grid3">{PROOF.map((p) => (<figure key={p.name} className="card"><blockquote>“{p.quote}”</blockquote><figcaption><b>{p.name}</b>{p.detail ? ` — ${p.detail}` : ''}</figcaption></figure>))}</div>
        </section>
      )}

      <section className="wrap" aria-labelledby="h-faq">
        <h2 id="h-faq">Frequently asked questions</h2>
        {FAQ.map((f) => (<details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>))}
      </section>

      <footer className="footer">
        <div className="wrap">
          <p className="footer-brand">MR. <b>TRANSACTION</b> ENGINEER</p>
          <p>{SITE.person}</p>
          <nav aria-label="Footer" className="footer-nav">
            <a href="#journey">Home</a><a href="#about">About</a><a href="#details">Summit</a>
            <a href={FOOTER_LINKS.contact.href}>{FOOTER_LINKS.contact.label}</a>
            {FOOTER_LINKS.legal.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
            {FOOTER_LINKS.social.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
          </nav>
          <CtaButton>{CTA.primary}</CtaButton>
          <p className="fine" id="terms">{DISCLAIMER}</p>
          <p className="fine" id="privacy">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
