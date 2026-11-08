import type { Metadata } from "next";
import PageShell, { PageIntro, SectionLabel } from "@/components/PageIntro";
import { PRINCIPLES, ROLES } from "@/lib/content";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <PageShell current="/careers">
      <PageIntro
        eyebrow="Careers"
        title="Build the stack end to end."
        lede="Engineers and researchers at QUBO work across silicon, software and markets. Teams are small, senior and work together on-site in Nairobi."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
        <SectionLabel index="01">How We Work</SectionLabel>
        <div className="mt-10 grid gap-px border border-qubo-line bg-qubo-line md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.k} className="bg-qubo-card p-8">
              <h3 className="font-serif text-2xl text-white">{p.k}</h3>
              <p className="mt-4 text-sm leading-relaxed text-qubo-muted">{p.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-qubo-line">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
          <SectionLabel index="02">Open Roles</SectionLabel>
          <div className="mt-10 divide-y divide-qubo-line border-y border-qubo-line">
            {ROLES.map((r) => (
              <div
                key={r.title}
                className="group grid gap-2 py-6 transition-colors hover:bg-white/[0.015] md:grid-cols-[1.6fr_1fr_1fr_120px] md:items-center md:gap-6"
              >
                <span className="font-serif text-xl text-white transition-colors group-hover:text-qubo-orange sm:text-2xl">{r.title}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-qubo-orange">{r.team}</span>
                <span className="text-sm text-qubo-muted">{r.location}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-qubo-dim md:text-right">{r.type}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-qubo-muted">
            Don&apos;t see your role? Write to <span className="select-all text-white">qubollcgroup@gmail.com</span>{" "}
            {/* TODO: replace with your careers inbox */}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
