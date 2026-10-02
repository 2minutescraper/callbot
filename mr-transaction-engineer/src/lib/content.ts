/**
 * Single source of truth for every word and asset on the site.
 *
 * RULES (from the brief):
 *  - Only content stated on the source page / supplied in the brief appears here.
 *  - Nothing in this file is an invented testimonial, result, statistic or guarantee.
 *  - Slots marked `TODO(approved)` must be filled with real, approved assets/copy.
 */

export const SITE = {
  name: 'Mr. Transaction Engineer',
  person: 'Eddie Raymond',
  title: 'Mr. Transaction Engineer | Free 3-Day Creative Strategy Summit',
  description:
    'Learn 9 creative real estate strategies — Subject-To, owner finance, lease options, wholesaling and more — in the free 3-day Transaction Engineer Creative Strategy Summit with Eddie Raymond.',
  canonical: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mrtransactionengineer.com',
};

/**
 * TODO(approved): replace with the exact Kajabi registration destination.
 * The live page could not be fetched from the build environment, so this
 * defaults to the existing funnel page. Set NEXT_PUBLIC_REGISTER_URL to override.
 */
export const REGISTER_URL =
  process.env.NEXT_PUBLIC_REGISTER_URL ??
  'https://mrtransactionengineer.mykajabi.com/real-estate-strategies';

export const CTA = { primary: 'SAVE MY SEAT', primaryFree: 'SAVE MY SEAT — FREE', secondary: 'REGISTER FREE' };

/** Approved photo/video slots. Leave null until real assets are dropped in /public/assets. */
export const ASSETS = {
  eddiePhoto: null as string | null, // e.g. '/assets/eddie.jpg'
  eddieVideo: null as string | null, // e.g. '/assets/eddie-intro.mp4'
  eddieAlt: 'Eddie Raymond, Mr. Transaction Engineer',
};

/** Real, approved proof only. Empty array = the proof environment is not rendered. */
export type Proof = { quote: string; name: string; detail?: string };
export const PROOF: Proof[] = [];

export const CREDENTIALS = [
  { big: '22+', label: 'Years in creative real estate' },
  { big: '1,100+', label: 'Deals closed' },
];
export const CREDENTIAL_LINES = [
  'Foreclosure, Sub-To & creative finance specialist',
  'Creator of Transaction Engineer Academy',
];

export type NodeKind =
  | 'seller' | 'property' | 'mortgage' | 'investor' | 'buyer' | 'cash'
  | 'cashflow' | 'equity' | 'terms' | 'contract' | 'exit';

export type StrategyGraph = {
  nodes: { id: string; kind: NodeKind; p: [number, number] }[];
  edges: [string, string][];
};

export type Strategy = {
  n: number;
  id: string;
  name: string;
  short: string;
  what: string;
  useful: string;
  learn: string;
  graph: StrategyGraph;
};

/**
 * Strategy names are from the source offer. Descriptions are general,
 * non-promissory definitions of each term — TODO(approved): swap in the
 * approved course copy where it differs.
 */
export const STRATEGIES: Strategy[] = [
  {
    n: 1, id: 'wholesaling', name: 'Wholesaling', short: 'Contract flows seller → buyer',
    what: 'Putting a property under contract and connecting it with an end buyer, rather than purchasing it yourself.',
    useful: 'Those who want to learn deal finding and contracts without relying on large amounts of cash.',
    learn: 'Creative wholesaling and fast-cash concepts are covered in the summit.',
    graph: { nodes: [
      { id: 's', kind: 'seller', p: [-1.6, 0] }, { id: 'c', kind: 'contract', p: [0, 0.2] },
      { id: 'b', kind: 'buyer', p: [1.6, 0] }, { id: 'p', kind: 'property', p: [0, -1.3] }],
      edges: [['s', 'c'], ['c', 'b'], ['p', 'c']] },
  },
  {
    n: 2, id: 'subject-to', name: 'Subject-To', short: 'Mortgage stays; terms change',
    what: 'Acquiring a property “subject to” the seller’s existing mortgage, which remains in place, with terms agreed between the parties.',
    useful: 'Those curious about structuring deals that do not start with a new bank loan.',
    learn: 'The summit covers where Sub-To opportunities can be found and how to structure and analyze them.',
    graph: { nodes: [
      { id: 's', kind: 'seller', p: [-1.8, 0.6] }, { id: 'p', kind: 'property', p: [0, 0.8] },
      { id: 'm', kind: 'mortgage', p: [0, -0.9] }, { id: 'i', kind: 'investor', p: [1.8, 0.6] }],
      edges: [['s', 'p'], ['p', 'm'], ['i', 'p'], ['i', 'm']] },
  },
  {
    n: 3, id: 'wraps-owner-finance', name: 'Wraps / Owner Finance', short: 'Seller → note → payments',
    what: 'Structures in which the seller finances part or all of the purchase, creating a note with agreed payments and terms.',
    useful: 'Those who want to understand seller-financed terms and how payments are structured.',
    learn: 'Owner finance and wraps are part of the summit’s creative structuring and cash flow training.',
    graph: { nodes: [
      { id: 's', kind: 'seller', p: [-1.8, 0] }, { id: 't', kind: 'terms', p: [0, 0.7] },
      { id: 'b', kind: 'buyer', p: [1.8, 0] }, { id: 'f', kind: 'cashflow', p: [0, -0.9] }],
      edges: [['s', 't'], ['t', 'b'], ['b', 'f'], ['f', 's']] },
  },
  {
    n: 4, id: 'lease-options', name: 'Lease Options', short: 'Property + tenant + contract',
    what: 'An agreement that combines a lease with an option to purchase the property under defined terms.',
    useful: 'Those exploring flexible structures between owners and occupants.',
    learn: 'The summit covers where lease option opportunities can be found and how to analyze them.',
    graph: { nodes: [
      { id: 'p', kind: 'property', p: [-1.7, 0] }, { id: 'c', kind: 'contract', p: [0, 0.8] },
      { id: 'b', kind: 'buyer', p: [1.7, 0] }, { id: 'i', kind: 'investor', p: [0, -0.9] }],
      edges: [['p', 'c'], ['c', 'b'], ['i', 'p'], ['i', 'c']] },
  },
  {
    n: 5, id: 'fix-and-flip', name: 'Fix & Flip', short: 'Property transformation',
    what: 'Purchasing a property, improving it, and selling it.',
    useful: 'Those who want to understand the full cycle from acquisition to exit.',
    learn: 'Included in the nine-strategy blueprint taught in the summit and academy.',
    graph: { nodes: [
      { id: 'i', kind: 'investor', p: [-1.8, 0] }, { id: 'p', kind: 'property', p: [-0.4, 0.4] },
      { id: 'c', kind: 'cash', p: [-0.4, -1.0] }, { id: 'b', kind: 'buyer', p: [1.1, 0.4] },
      { id: 'x', kind: 'exit', p: [2.3, 0] }],
      edges: [['i', 'p'], ['c', 'p'], ['p', 'b'], ['b', 'x']] },
  },
  {
    n: 6, id: 'buy-and-hold', name: 'Buy & Hold', short: 'Property with recurring cash flow',
    what: 'Acquiring a property to hold over time, with rental income and equity as part of the plan.',
    useful: 'Those thinking about longer-term holdings alongside faster-cash strategies.',
    learn: 'Rentals and long-term wealth concepts are part of Day 3 of the summit.',
    graph: { nodes: [
      { id: 'i', kind: 'investor', p: [-1.8, 0] }, { id: 'p', kind: 'property', p: [0, 0.2] },
      { id: 'f', kind: 'cashflow', p: [1.8, 0.8] }, { id: 'e', kind: 'equity', p: [1.8, -0.8] }],
      edges: [['i', 'p'], ['p', 'f'], ['p', 'e']] },
  },
  {
    n: 7, id: 'short-sales', name: 'Short Sales', short: 'Seller, lender and investor',
    what: 'Sales in which the lender agrees to accept less than the mortgage balance owed.',
    useful: 'Those who want to understand negotiating with lenders when a seller is under pressure.',
    learn: 'Included in the nine-strategy blueprint; negotiation fundamentals are central to the summit.',
    graph: { nodes: [
      { id: 's', kind: 'seller', p: [-1.8, 0.4] }, { id: 'm', kind: 'mortgage', p: [0, 0.9] },
      { id: 'i', kind: 'investor', p: [1.8, 0.4] }, { id: 'p', kind: 'property', p: [0, -0.9] }],
      edges: [['s', 'm'], ['m', 'i'], ['s', 'p'], ['i', 'p']] },
  },
  {
    n: 8, id: 'systems', name: 'Systems · Marketing · Negotiation · Deal Structuring', short: 'Interconnected deal systems',
    what: 'The repeatable processes behind finding sellers, opening conversations, negotiating and structuring terms.',
    useful: 'Those who want a process instead of one-off deals.',
    learn: 'Lead sources, opening conversations, discovery sheets and seller script training are covered in the summit.',
    graph: { nodes: [
      { id: 's', kind: 'seller', p: [-2.2, 0] }, { id: 'p', kind: 'property', p: [-0.9, 0.7] },
      { id: 't', kind: 'terms', p: [0.4, 0] }, { id: 'c', kind: 'contract', p: [1.6, 0.7] },
      { id: 'x', kind: 'exit', p: [2.6, -0.4] }],
      edges: [['s', 'p'], ['p', 't'], ['t', 'c'], ['c', 'x'], ['s', 't']] },
  },
  {
    n: 9, id: 'scaling', name: 'Scaling & Hiring', short: 'Transactions expanding outward',
    what: 'Building a team and processes so more transactions can be handled.',
    useful: 'Those who have started and want to understand growing beyond doing everything alone.',
    learn: 'Part of the nine-strategy blueprint taught in Transaction Engineer Academy.',
    graph: { nodes: [
      { id: 'i', kind: 'investor', p: [0, 0] }, { id: 'p1', kind: 'property', p: [-1.9, 0.8] },
      { id: 'p2', kind: 'property', p: [1.9, 0.8] }, { id: 'p3', kind: 'property', p: [-1.4, -1.0] },
      { id: 'p4', kind: 'property', p: [1.4, -1.0] }],
      edges: [['i', 'p1'], ['i', 'p2'], ['i', 'p3'], ['i', 'p4']] },
  },
];

export const SUMMIT_DAYS = [
  {
    day: 1, title: 'FIND THE DEAL',
    items: [
      'Where creative deals are hiding',
      'Identifying real motivation',
      'Nine lead sources',
      'The “No Equity → Yes Deal” method',
      'Opening conversations correctly',
      'Pulling leads and completing discovery sheets',
    ],
  },
  {
    day: 2, title: 'STRUCTURE THE DEAL',
    items: ['The TE Deal Analyzer', 'The 3 key numbers', 'Subject-To', 'Lease Options', 'Owner Finance', 'Creative structuring and deal analysis'],
  },
  {
    day: 3, title: 'BUILD THE OUTCOME',
    items: ['Fast cash', 'Creative wholesaling', 'Cash flow and rentals', 'Wraps and paydown', 'Long-term wealth through creative finance'],
  },
];

export const RESOURCES = [
  { id: 'assignments', title: 'Daily action assignments', body: 'Implementation-focused assignments so you act on what you learn each day.' },
  { id: 'contracts', title: 'Contract templates', body: 'Templates used for creative deal structures.' },
  { id: 'recordings', title: 'Real seller call recordings', body: 'Listen to real seller conversations and live seller script training: what to say and how to say it.' },
  { id: 'analyzer', title: 'TE Deal Analyzer', body: 'A spreadsheet for analyzing Subject-To, Lease Options, Owner Finance, Wholesaling and more.' },
  { id: 'community', title: 'Private TE Facebook community', body: 'Private community access for summit registrants.' },
];

export const FOR_WHO = [
  'Beginners', 'Wholesalers', 'Investors', 'People without large amounts of cash',
  'People who want to learn creative finance', 'People who are stuck', 'People dealing with market uncertainty',
];
export const NOT_FOR = ['No excuses.', 'No passive watching.', 'No theory without action.', 'No shortcut mentality.'];

export const FAQ = [
  { q: 'What is the Transaction Engineer Creative Strategy Summit?', a: 'A free 3-day virtual summit focused on creative real estate strategies, deal finding, deal structuring, fast cash and long-term wealth building, taught by Eddie Raymond.' },
  { q: 'What do I receive when I register?', a: 'Summit registration includes daily action assignments, contract templates, real seller call recordings, the TE Deal Analyzer spreadsheet and access to the private TE Facebook community.' },
  { q: 'Who is it not for?', a: 'The summit is not for people seeking get-rich-quick schemes, unwilling to take action, or looking for theory instead of real-world strategies.' },
  { q: 'Do I need a lot of cash?', a: 'The summit is intended for people at different stages, including those without large amounts of cash. Individual results vary and are never guaranteed.' },
];

export const DISCLAIMER =
  'Educational content only. Real estate investing involves risk, including the loss of capital. Nothing on this site is legal, tax, financial or investment advice, and no results or income are guaranteed or implied. Strategies may not be suitable for every property, person or market, and laws vary by location — consult qualified professionals. Visualizations on this site are hypothetical illustrations, not real transactions.';

export const FOOTER_LINKS = {
  // TODO(approved): replace with the real legal / contact / social destinations.
  legal: [{ label: 'Privacy', href: '#privacy' }, { label: 'Terms', href: '#terms' }],
  contact: { label: 'Contact', href: REGISTER_URL },
  social: [] as { label: string; href: string }[],
};
