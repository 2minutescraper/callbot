import Experience from '@/components/Experience';
import { Details } from '@/components/Details';
import { SITE } from '@/lib/content';

export default function Page() {
  return (
    <main>
      <h1 className="sr-only">{SITE.name}: free 3-day Creative Strategy Summit with {SITE.person}. Learn 9 creative real estate strategies and how to engineer the transaction.</h1>
      <Experience />
      <Details />
    </main>
  );
}
