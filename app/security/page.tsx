import type { Metadata } from "next";
import PageShell, { PageIntro, SectionLabel } from "@/components/PageIntro";
import { FRAMEWORKS, GOVERNANCE, SECURITY_CONTROLS } from "@/lib/content";

export const metadata: Metadata = { title: "Security & Governance" };

export default function SecurityPage() {
  return (
    <PageShell current="/security">
      <PageIntro
        eyebrow="Institutional Governance & Security"
        title="Speed is earned through control."
        lede="Every microsecond we remove from the path is matched with a control we add around it."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
        <SectionLabel index="01">Governance</SectionLabel>
        <dl className="mt-10 grid gap-px border border-qubo-line bg-qubo-line sm:grid-cols-2 lg:grid-cols-4">
          {GOVERNANCE.map((g) => (
            <div key={g.k} className="bg-qubo-bg p-8">
              <dt className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                <span className="h-1.5 w-1.5 bg-qubo-orange" />
                {g.k}
              </dt>
              <dd className="mt-4 text-sm leading-relaxed text-qubo-muted">{g.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-qubo-line">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.6fr] lg:py-24">
          <div>
            <SectionLabel index="02">Security Controls</SectionLabel>
            <h2 className="mt-8 font-serif text-4xl leading-[1.08] text-white sm:text-5xl">Defence in depth.</h2>
          </div>
          <div className="divide-y divide-qubo-line border-y border-qubo-line">
            {SECURITY_CONTROLS.map((c) => (
              <div key={c.control} className="grid gap-2 py-6 sm:grid-cols-[160px_1fr] sm:gap-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-qubo-orange">{c.control}</span>
                <span className="text-sm leading-relaxed text-neutral-300">{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-qubo-line">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
          <SectionLabel index="03">Frameworks &amp; Regulation</SectionLabel>
          <ul className="mt-8 flex flex-wrap gap-3">
            {FRAMEWORKS.map((f) => (
              <li key={f} className="border border-qubo-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
