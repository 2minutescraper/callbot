import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FAQ, SITE, STRATEGIES } from '@/lib/content';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.canonical),
  title: SITE.title,
  description: SITE.description,
  alternates: { canonical: '/' },
  keywords: ['Mr. Transaction Engineer', 'Eddie Raymond', 'creative real estate', 'creative financing', 'Subject-To', 'owner finance', 'lease options', 'wholesaling', 'fix and flip', 'buy and hold', 'short sales', 'Transaction Engineer Academy', '3-Day Creative Strategy Summit'],
  openGraph: { type: 'website', title: SITE.title, description: SITE.description, siteName: SITE.name, url: '/' },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  // TODO(approved): add an approved og:image (e.g. a still of Eddie / summit graphic).
};
export const viewport: Viewport = { themeColor: '#07080a', width: 'device-width', initialScale: 1 };

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: SITE.name, url: SITE.canonical, founder: { '@type': 'Person', name: SITE.person } },
    { '@type': 'Person', name: SITE.person, alternateName: 'Mr. Transaction Engineer', jobTitle: 'Creative real estate educator' },
    { '@type': 'WebSite', name: SITE.name, url: SITE.canonical, description: SITE.description },
    { '@type': 'ItemList', name: '9-Strategy Blueprint', itemListElement: STRATEGIES.map((s) => ({ '@type': 'ListItem', position: s.n, name: s.name })) },
    { '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
