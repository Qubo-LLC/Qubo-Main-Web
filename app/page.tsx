import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import QuantumMeshCanvas from "@/components/QuantumMeshCanvas";
import BlackHoleCanvas from "@/components/BlackHoleCanvas";
import TelemetryTicker from "@/components/TelemetryTicker";
import { SectionLabel } from "@/components/PageIntro";
import { METRICS, NAV } from "@/lib/content";
import { PRODUCTS } from "@/lib/products";

const DIRECTORY: Record<string, string> = {
  "/ecosystem": "Valtrius, Qubex and Synatra — three engines on one architecture.",
  "/infrastructure": "Silicon to settlement: four owned layers on Google Cloud in Nairobi and South Africa.",
  "/research": "Working papers and notes on microstructure, learning and portfolio theory.",
  "/security": "Model risk, zero-trust security, compliance and hardware kill switches.",
  "/careers": "Small, senior teams building the stack end to end.",
};

export default function HomePage() {
  return (
    <>
      <main>
        {/* ───────────── SCREEN 1 · QUANTUM TOPOLOGY HERO ───────────── */}
        <section className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden">
          <QuantumMeshCanvas />

          <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-24 pt-32 sm:px-8 lg:pb-28 lg:pt-36">
            <div className="pointer-events-auto max-w-3xl">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em]">
                <span className="text-qubo-orange">Quantitative Technology &amp; Liquidity</span>
                <span className="hidden h-3 w-px bg-qubo-line sm:block" />
                <span className="text-qubo-muted">Research → Systems → Markets</span>
              </div>

              <h1 className="mt-8 font-serif text-[44px] font-normal leading-[1.04] tracking-[-0.015em] text-white sm:text-6xl lg:text-[80px]">
                Quantitative Rigor.
                <br />
                <span className="text-neutral-300">Sub-Microsecond</span>{" "}
                <span className="text-qubo-orange [text-shadow:0_0_40px_rgba(255,85,0,0.35)]">Execution.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-relaxed text-qubo-muted sm:text-lg">
                C++ latency engineering, Synatra AI, Valtrius wealth optimization, and Qubex central execution. An
                integrated quantitative stack connecting research, execution, and liquidity.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/ecosystem"
                  className="bg-qubo-orange px-6 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-black transition-shadow hover:shadow-[0_0_30px_rgba(255,85,0,0.5)]"
                >
                  Explore the Engines
                </Link>
                <Link
                  href="/infrastructure"
                  className="border border-white/20 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-white transition-colors hover:border-qubo-orange hover:text-qubo-orange"
                >
                  Infrastructure Overview
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── SCREEN 2 · BLACK HOLE ───────────── */}
        <section className="relative flex min-h-[100svh] items-end overflow-hidden lg:items-center">
          <BlackHoleCanvas />

          <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-28 pt-24 sm:px-8 lg:py-32">
            <div className="pointer-events-auto max-w-xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-qubo-orange">
                Convergence · Event Horizon
              </div>
              <h2 className="mt-8 font-serif text-4xl font-normal leading-[1.06] tracking-[-0.01em] text-white [text-wrap:balance] sm:text-5xl lg:text-[64px]">
                Every flow converges on one core.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-qubo-muted sm:text-lg">
                Signals, portfolios and order flow are drawn into a single execution core. Nothing escapes the
                ledger: every decision is captured, time-stamped and reconciled the moment it crosses the horizon.
              </p>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-px border border-qubo-line bg-qubo-line font-mono">
                {PRODUCTS.map((p) => (
                  <div key={p.slug} className="bg-qubo-bg/80 p-4 backdrop-blur-sm">
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-qubo-dim">{p.name}</dt>
                    <dd className="mt-2 text-sm tabular-nums text-white">{p.heroMetric.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ───────────── EXECUTIVE METRICS STRIP (home only) ───────────── */}
        <section aria-label="Executive metrics" className="relative z-10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-qubo-line sm:grid-cols-3 lg:grid-cols-6">
            {METRICS.map((m) => (
              <div key={m.label} className="bg-qubo-bg px-5 py-8 sm:px-8">
                <div className="font-serif text-4xl font-normal tabular-nums text-white lg:text-[42px]">
                  {m.value}
                  <span className="ml-0.5 text-xl text-qubo-orange">{m.unit}</span>
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-qubo-muted">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        <TelemetryTicker />

        {/* ───────────── DIRECTORY · ONE PAGE PER AREA ───────────── */}
        <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionLabel index="00">The Firm</SectionLabel>
              <h2 className="mt-8 font-serif text-4xl leading-[1.08] text-white [text-wrap:balance] sm:text-5xl">
                One stack. From hypothesis to settlement.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-qubo-muted">
                QUBO operates as a single quantitative system. Research produces signals, signals inform portfolios,
                and portfolios route through a microsecond fabric that settles into the ledger research reads from.
              </p>
            </div>

            <nav aria-label="Sections" className="divide-y divide-qubo-line border-y border-qubo-line">
              {NAV.map((n, i) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="group grid grid-cols-[48px_1fr_24px] items-center gap-4 py-6 transition-colors hover:bg-white/[0.015]"
                >
                  <span className="font-mono text-[11px] text-qubo-orange">0{i + 1}</span>
                  <span>
                    <span className="block font-serif text-2xl text-white transition-colors group-hover:text-qubo-orange sm:text-[28px]">
                      {n.label}
                    </span>
                    <span className="mt-1 block text-sm text-qubo-muted">{DIRECTORY[n.href]}</span>
                  </span>
                  <span className="text-qubo-muted transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
