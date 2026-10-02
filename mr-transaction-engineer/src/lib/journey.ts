import { SUMMIT_DAYS } from './content';

export type V3 = [number, number, number];

export const SCENE_SPACING = 50;
/** world origin of station i */
export const stationOrigin = (i: number): V3 => [0, 0, -i * SCENE_SPACING];

export type Station = { id: string; chapter: number; cam: V3; look: V3 };

/** cam / look are offsets relative to the station's scene origin. */
export const STATIONS: Station[] = [
  { id: 'lab', chapter: 0, cam: [0, 3.4, 15], look: [0, 0.9, 0] },
  { id: 'opportunity', chapter: 0, cam: [-4.5, 3.4, 12], look: [5, 3, -14] },
  { id: 'conventional', chapter: 1, cam: [0, 2.6, 15], look: [0, 2.2, -6] },
  { id: 'structure', chapter: 2, cam: [6, 3.2, 11], look: [0, 2.2, 0] },
  { id: 'eddie', chapter: 2, cam: [-3.5, 2.4, 12], look: [3, 2.8, 0] },
  { id: 'engine', chapter: 3, cam: [0, 3.2, 7], look: [0, 2.6, -9] },
  { id: 'corridor', chapter: 3, cam: [0, 2.6, 9], look: [0, 2, -14] },
  { id: 'neighborhood', chapter: 3, cam: [0, 5.2, 17], look: [0, 1.5, -16] },
  { id: 'seller', chapter: 3, cam: [2.5, 2.6, 9], look: [-2.5, 2.2, 0] },
  { id: 'analyzer', chapter: 4, cam: [0, 4, 13], look: [0, 3, 0] },
  { id: 'implementation', chapter: 4, cam: [0, 3, 2], look: [0, 2.6, -8] },
  { id: 'day1', chapter: 5, cam: [0, 3.2, 14], look: [0, 4, -4] },
  { id: 'day2', chapter: 5, cam: [-3, 3.4, 13], look: [0, 4, -4] },
  { id: 'day3', chapter: 5, cam: [3, 3.6, 12], look: [0, 4, -4] },
  { id: 'factory', chapter: 5, cam: [-9, 4.5, 15], look: [0, 3, -10] },
  { id: 'audience', chapter: 5, cam: [0, 2.5, 10], look: [0, 2, 0] },
  { id: 'not-for', chapter: 5, cam: [0, 2.2, 9], look: [0, 2, 0] },
  { id: 'plan', chapter: 6, cam: [0, 6, 12], look: [0, 1, -22] },
  { id: 'final', chapter: 6, cam: [0, 2.2, 10], look: [0, 2.2, 0] },
];
export const LAST = STATIONS.length - 1;
export const ST = Object.fromEntries(STATIONS.map((s, i) => [s.id, i])) as Record<string, number>;

export const CHAPTERS = [
  { n: '01', name: 'THE OPPORTUNITY', from: 0 },
  { n: '02', name: 'THE PROBLEM', from: 2 },
  { n: '03', name: 'STRUCTURE THE DEAL', from: 3 },
  { n: '04', name: 'THE 9 STRATEGIES', from: 5 },
  { n: '05', name: 'THE ENGINE', from: 9 },
  { n: '06', name: 'THE SUMMIT', from: 11 },
  { n: '07', name: 'THE TRANSACTION ENGINEER', from: 17 },
];
export const chapterAt = (s: number) => {
  let c = 0;
  CHAPTERS.forEach((ch, i) => { if (s >= ch.from - 0.05) c = i; });
  return c;
};

/** Hold at the end so the final CTA settles before the page scrolls on to the footer. */
export const END_HOLD = 0.05;
/** Map raw scroll progress 0..1 → station units, easing each leg so the camera dwells at stations. */
/** Per-leg easing with a plateau at each end: the camera genuinely rests at every station. */
const DWELL = 0.12;
const ease = (p: number) => { const t = Math.min(1, Math.max(0, (p - DWELL) / (1 - 2 * DWELL))); return t * t * (3 - 2 * t); };
export function progressToS(p: number) {
  const lin = Math.min(LAST, Math.max(0, p * LAST * (1 + END_HOLD)));
  if (lin >= LAST) return LAST;
  const i = Math.min(LAST - 1, Math.floor(lin));
  return i + ease(lin - i);
}
export const sToProgress = (s: number) => {
  // inverse of progressToS (smoothstep inverse via bisection)
  const i = Math.min(LAST - 1, Math.floor(s));
  const target = s - i;
  let lo = 0, hi = 1;
  for (let k = 0; k < 24; k++) {
    const m = (lo + hi) / 2;
    if (ease(m) < target) lo = m; else hi = m;
  }
  return (i + (lo + hi) / 2) / (LAST * (1 + END_HOLD));
};

export type Beat = {
  id: string;
  s0: number;
  s1: number;
  align?: 'center' | 'left' | 'right' | 'bottom';
  size?: 'xl' | 'lg' | 'md' | 'sm';
  lines: string[];
  sub?: string;
  list?: string[];
  tag?: string;
};

export const BEATS: Beat[] = [
  { id: 'b1', s0: 0.0, s1: 0.45, size: 'lg', lines: ['REAL ESTATE', 'ISN’T JUST ABOUT FINDING HOUSES.'] },
  { id: 'b2', s0: 0.5, s1: 0.95, size: 'lg', lines: ['IT’S ABOUT FINDING THE DEAL.'] },
  { id: 'b3', s0: 1.05, s1: 1.35, size: 'md', align: 'bottom', lines: ['EVERY PROPERTY HAS A STORY.'] },
  { id: 'b4', s0: 1.38, s1: 1.68, size: 'md', align: 'bottom', lines: ['EVERY SELLER HAS A PROBLEM.'] },
  { id: 'b5', s0: 1.7, s1: 1.86, size: 'md', align: 'bottom', lines: ['EVERY PROBLEM CAN CHANGE THE STRUCTURE OF A DEAL.'] },
  { id: 'b6', s0: 1.95, s1: 2.42, size: 'sm', align: 'bottom', lines: ['PROPERTY → BANK → LOAN → CREDIT → DOWN PAYMENT → CLOSING'] },
  { id: 'b7', s0: 2.55, s1: 2.95, size: 'xl', lines: ['CREATIVE.'] },
  { id: 'b8', s0: 3.02, s1: 3.45, size: 'lg', lines: ['DON’T JUST LOOK AT THE PROPERTY.', 'ENGINEER THE TRANSACTION.'] },
  { id: 'b9', s0: 3.85, s1: 4.4, size: 'md', align: 'left', lines: ['EDDIE RAYMOND', '“MR. TRANSACTION ENGINEER”'] },
  { id: 'b10', s0: 4.45, s1: 4.95, size: 'sm', align: 'left', lines: ['FORECLOSURE, SUB-TO & CREATIVE FINANCE SPECIALIST', 'CREATOR OF TRANSACTION ENGINEER ACADEMY'] },
  { id: 'b11', s0: 4.88, s1: 5.4, size: 'sm', align: 'bottom', tag: 'THE 9-STRATEGY ENGINE', lines: ['SELECT A STRATEGY TO EXPLORE IT.'] },
  { id: 'b12', s0: 5.45, s1: 5.86, size: 'md', align: 'bottom', lines: ['ONE DEAL DOESN’T HAVE ONLY ONE PATH.'] },
  { id: 'b13', s0: 5.88, s1: 6.86, size: 'lg', align: 'bottom', lines: ['MULTIPLE STRATEGIES.', 'MULTIPLE WAYS TO GET PAID.'], sub: 'Not every strategy fits every property. Outcomes are never guaranteed.' },
  { id: 'b14', s0: 6.88, s1: 7.45, size: 'xl', lines: ['LOOK CLOSER.'] },
  { id: 'b15', s0: 7.5, s1: 7.97, size: 'md', lines: ['THE BEST OPPORTUNITIES', 'AREN’T ALWAYS OBVIOUS.'], sub: 'Learn where Sub-To, Lease Option and Owner Finance opportunities can be found, how to identify motivation, and the “No Equity → Yes Deal” method.' },
  { id: 'b16', s0: 7.95, s1: 8.5, size: 'md', align: 'left', lines: ['KNOWING WHAT TO SAY MATTERS.'], sub: 'Live seller script training: what to say and how to say it.' },
  { id: 'b17', s0: 8.88, s1: 9.42, size: 'xl', lines: ['RUN THE NUMBERS.'] },
  { id: 'b18', s0: 9.5, s1: 9.97, size: 'lg', lines: ['STRUCTURE THE DEAL.'], sub: 'The TE Deal Analyzer: Subject-To, Lease Options, Owner Finance, Wholesaling and more. Hypothetical illustration.' },
  { id: 'b19', s0: 9.95, s1: 10.6, size: 'sm', align: 'bottom', tag: 'INCLUDED WITH SUMMIT REGISTRATION', lines: ['SELECT A RESOURCE TO PREVIEW IT.'] },
  { id: 'b20', s0: 10.88, s1: 11.4, size: 'md', align: 'left', tag: 'DAY 1', lines: [SUMMIT_DAYS[0].title], list: SUMMIT_DAYS[0].items },
  { id: 'b21', s0: 11.88, s1: 12.4, size: 'md', align: 'right', tag: 'DAY 2', lines: [SUMMIT_DAYS[1].title], list: SUMMIT_DAYS[1].items },
  { id: 'b22', s0: 12.88, s1: 13.4, size: 'md', align: 'left', tag: 'DAY 3', lines: [SUMMIT_DAYS[2].title], list: SUMMIT_DAYS[2].items },
  { id: 'b23', s0: 13.88, s1: 14.95, size: 'lg', align: 'bottom', lines: ['TURNING OPPORTUNITIES INTO TRANSACTIONS.'], sub: 'Hypothetical illustration of the deal process.' },
  { id: 'b24', s0: 14.88, s1: 15.95, size: 'md', align: 'left', tag: 'WHO THIS IS FOR', lines: ['BEGINNERS · WHOLESALERS · INVESTORS'], list: ['People without large amounts of cash', 'People who want to learn creative finance', 'People who are stuck', 'People dealing with market uncertainty'] },
  { id: 'b25', s0: 15.88, s1: 16.95, size: 'lg', lines: ['THIS IS NOT A GET-RICH-QUICK SYSTEM.'], list: ['NO EXCUSES.', 'NO PASSIVE WATCHING.', 'NO THEORY WITHOUT ACTION.', 'NO SHORTCUT MENTALITY.'] },
  { id: 'b26', s0: 16.88, s1: 17.45, size: 'lg', lines: ['FAST CASH.', 'CASH FLOW.', 'LONG-TERM WEALTH.'], sub: 'The educational framework taught in the summit. No results are guaranteed.' },
  { id: 'b27', s0: 17.55, s1: 17.78, size: 'lg', lines: ['SEE THE DEAL DIFFERENTLY.'] },
  { id: 'b28', s0: 17.8, s1: 17.95, size: 'lg', lines: ['BECOME THE TRANSACTION ENGINEER.'] },
];

/** Final CTA environment is visible from here on. */
export const FINAL_FROM = 17.96;
