import type { Metadata } from "next";
import PageShell, { PageIntro, SectionLabel } from "@/components/PageIntro";
import EngineGrid from "@/components/EngineGrid";

export const metadata: Metadata = { title: "Ecosystem" };

const FLOWS = [
  { from: "SYNATRA", to: "QUBEX", what: "Alpha signals published in < 2 µs" },
  { from: "SYNATRA", to: "VALTRIUS", what: "Expected returns and risk forecasts" },
  { from: "VALTRIUS", to: "QUBEX", what: "Rebalancing orders, tax-lot aware" },
  { from: "QUBEX", to: "VALTRIUS", what: "Fills, positions and cash in real time" },
  { from: "QUBEX", to: "SYNATRA", what: "Execution and microstructure telemetry" },
];

export default function EcosystemPage() {
  return (
    <PageShell current="/ecosystem">
      <PageIntro
        eyebrow="Ecosystem · Core Institutional Engines"
        title="Three engines. One quantitative architecture."
        lede="Each engine runs independently and interoperates natively, sharing data, risk and ledger state in real time."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-24">
        <EngineGrid />
      </section>

      <section className="border-t border-qubo-line">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.5fr] lg:py-24">
          <div>
            <SectionLabel index="01">Interoperability</SectionLabel>
            <h2 className="mt-8 font-serif text-4xl leading-[1.08] text-white sm:text-5xl">How the engines talk.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-qubo-muted">
              Engines exchange state over a shared low-latency bus. There are no nightly exports and no
              reconciliation spreadsheets between them.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse font-mono text-[12px]">
              <thead>
                <tr className="border-b border-qubo-line text-left text-[10px] uppercase tracking-[0.18em] text-qubo-dim">
                  <th className="py-3 pr-4 font-normal">From</th>
                  <th className="py-3 pr-4 font-normal">To</th>
                  <th className="py-3 font-normal">Payload</th>
                </tr>
              </thead>
              <tbody>
                {FLOWS.map((f) => (
                  <tr key={f.from + f.to} className="border-b border-qubo-line">
                    <td className="py-4 pr-4 text-white">{f.from}</td>
                    <td className="py-4 pr-4 text-qubo-orange">→ {f.to}</td>
                    <td className="py-4 font-sans text-sm text-qubo-muted">{f.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </PageShell>
  );
}
