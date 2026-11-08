import type { Metadata } from "next";
import PageShell, { PageIntro, SectionLabel } from "@/components/PageIntro";
import { INFRA_LAYERS, SERVERS } from "@/lib/content";

export const metadata: Metadata = { title: "Infrastructure" };

export default function InfrastructurePage() {
  return (
    <PageShell current="/infrastructure">
      <PageIntro
        eyebrow="Technical Infrastructure"
        title="Engineered at the speed of the wire."
        lede="Four vertically integrated layers, owned end to end. No third-party hop sits between a signal and the exchange, or between a fill and the books."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
        <SectionLabel index="01">The Stack</SectionLabel>
        <div className="mt-10 grid gap-px border border-qubo-line bg-qubo-line sm:grid-cols-2 lg:grid-cols-4">
          {INFRA_LAYERS.map((l) => (
            <div key={l.code} className="scan-card flex flex-col bg-qubo-bg p-8">
              <span className="draw-line" />
              <div className="font-mono text-xs text-qubo-orange">{l.code}</div>
              <h3 className="mt-10 text-lg font-medium text-white">{l.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-qubo-muted">{l.body}</p>
              <ul className="mb-8 mt-6 space-y-2">
                {l.detail.map((d) => (
                  <li key={d} className="flex items-center gap-3 text-[13px] text-neutral-300">
                    <span className="h-px w-3 bg-qubo-orange" />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-qubo-line pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
                {l.stat}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-qubo-line">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
          <SectionLabel index="02">Server Footprint</SectionLabel>
          <h2 className="mt-8 font-serif text-4xl leading-[1.08] text-white sm:text-5xl">Where our servers sit.</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-qubo-muted">
            QUBO currently runs on two Google Cloud servers, one in Nairobi and one in South Africa.
          </p>
          <div className="mt-10 grid gap-px border border-qubo-line bg-qubo-line sm:grid-cols-2">
            {SERVERS.map((s) => (
              <div key={s.name} className="scan-card bg-qubo-card p-8">
                <span className="draw-line" />
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-sm text-white">{s.name}</span>
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-qubo-orange">
                    <span className="glow-dot h-1.5 w-1.5 animate-pulse rounded-full bg-qubo-orange" />
                    {s.status}
                  </span>
                </div>
                <div className="mt-10 font-serif text-3xl text-white">{s.location}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-qubo-muted">{s.provider}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
