import type { Metadata } from "next";
import PageShell, { PageIntro, SectionLabel } from "@/components/PageIntro";
import { RESEARCH, RESEARCH_AREAS } from "@/lib/content";

export const metadata: Metadata = { title: "Quantitative Research" };

export default function ResearchPage() {
  return (
    <PageShell current="/research">
      <PageIntro
        eyebrow="Quantitative Research"
        title="Evidence before conviction."
        lede="Our researchers publish internally to the same standard as a journal: stated hypotheses, pinned datasets, walk-forward validation and independent review."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
        <SectionLabel index="01">Recent Publications</SectionLabel>
        <div className="mt-10 divide-y divide-qubo-line border-y border-qubo-line">
          {RESEARCH.map((r) => (
            <article key={r.title} className="group grid gap-3 py-8 md:grid-cols-[200px_1fr_180px] md:gap-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-qubo-orange">{r.tag}</span>
              <div>
                <h3 className="font-serif text-2xl text-white transition-transform group-hover:translate-x-1 sm:text-[28px]">{r.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-qubo-muted">{r.abstract}</p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-qubo-dim md:text-right">{r.meta}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-qubo-line">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
          <SectionLabel index="02">Research Areas</SectionLabel>
          <div className="mt-10 grid gap-px border border-qubo-line bg-qubo-line sm:grid-cols-2 lg:grid-cols-4">
            {RESEARCH_AREAS.map((a) => (
              <div key={a.area} className="scan-card bg-qubo-card p-8">
                <span className="draw-line" />
                <h3 className="font-serif text-2xl text-white">{a.area}</h3>
                <p className="mt-4 text-sm leading-relaxed text-qubo-muted">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
