import Link from "next/link";
import SiteFooter from "./SiteFooter";
import { NAV } from "@/lib/content";

export function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-qubo-muted">
      <span className="text-qubo-orange">{index}</span>
      <span className="h-px w-10 bg-qubo-line" />
      {children}
    </div>
  );
}

/** Shared editorial opener used by every section page. */
export function PageIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
}) {
  return (
    <section className="grid-lines relative border-b border-qubo-line">
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-16 sm:px-8 lg:pb-24 lg:pt-24">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-qubo-orange">{eyebrow}</div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <h1 className="font-serif text-5xl font-normal leading-[1.04] tracking-[-0.015em] text-white [text-wrap:balance] sm:text-6xl lg:text-[72px]">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-qubo-muted sm:text-lg">{lede}</p>
        </div>
      </div>
    </section>
  );
}

/** Header + main + "next page" link + footer. */
export default function PageShell({ current, children }: { current: string; children: React.ReactNode }) {
  const i = NAV.findIndex((n) => n.href === current);
  const next = NAV[(i + 1) % NAV.length];
  return (
    <>
      <main>
        {children}
        <section className="border-t border-qubo-line">
          <Link href={next.href} className="scan-card group mx-auto flex max-w-[1400px] items-center justify-between px-5 py-12 sm:px-8">
            <span className="draw-line" />
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-qubo-dim">Next</span>
              <span className="mt-2 block font-serif text-3xl text-white group-hover:text-qubo-orange sm:text-4xl">{next.label}</span>
            </span>
            <span className="text-2xl text-qubo-muted transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
