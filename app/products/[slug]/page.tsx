import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import ProductFlowDiagram from "@/components/ProductFlowDiagram";
import { PRODUCTS, getProduct } from "@/lib/products";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return { title: `${p.name} — ${p.tagline}`, description: p.summary };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = PRODUCTS.filter((p) => p.slug !== product.slug);
  const displayName = product.name.charAt(0) + product.name.slice(1).toLowerCase();

  return (
    <>
      {/* NOTE: no global telemetry ticker on detail pages */}

      <main>
        {/* Mobile back link (header hides it on small screens) */}
        <div className="mx-auto max-w-[1400px] px-5 pt-6 sm:hidden">
          <Link href="/ecosystem" className="font-mono text-[11px] uppercase tracking-[0.16em] text-qubo-muted hover:text-qubo-orange">
            ← Back to Architecture Overview
          </Link>
        </div>

        {/* ───────────── PRODUCT HERO ───────────── */}
        <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-12 sm:px-8 lg:pb-20 lg:pt-20">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em]">
            <span className="text-qubo-orange">Engine {product.index}</span>
            <span className="h-3 w-px bg-qubo-line" />
            <span className="text-qubo-muted">{product.category}</span>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <h1 className="font-serif text-6xl font-normal leading-none tracking-[-0.015em] text-white sm:text-7xl lg:text-[104px]">
                {product.name}
                <span className="glow-dot ml-2 inline-block h-3 w-3 rounded-full bg-qubo-orange align-baseline" />
              </h1>
              <p className="mt-6 font-serif text-2xl text-neutral-300 sm:text-3xl">{product.tagline}</p>
            </div>
            <div>
              <p className="text-base leading-relaxed text-qubo-muted sm:text-lg">{product.description}</p>
              <div className="mt-8 flex items-end gap-6 border-t border-qubo-line pt-6">
                <div className="font-serif text-5xl text-white">{product.heroMetric.value}</div>
                <div className="pb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-qubo-muted">
                  {product.heroMetric.label}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── FLOW DIAGRAM ───────────── */}
        <section className="border-t border-qubo-line">
          <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-qubo-muted">
                  <span className="text-qubo-orange">01</span> — Data Flow Architecture
                </div>
                <h2 className="mt-5 font-serif text-3xl text-white sm:text-4xl">{product.flowTitle}</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-qubo-muted">{product.flowCaption}</p>
            </div>

            <div className="relative mt-10 border border-qubo-line bg-qubo-bg p-3 sm:p-6">
              <div className="absolute right-4 top-4 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-qubo-orange">
                <span className="glow-dot h-1.5 w-1.5 animate-pulse rounded-full bg-qubo-orange" />
                Live Simulation
              </div>
              <ProductFlowDiagram slug={product.slug} />
            </div>

            <ul className="mt-8 grid gap-px border border-qubo-line bg-qubo-line sm:grid-cols-2 lg:grid-cols-4">
              {product.capabilities.map((c, i) => (
                <li key={c} className="flex items-center gap-4 bg-qubo-bg px-6 py-5 text-sm text-neutral-200">
                  <span className="font-mono text-[11px] text-qubo-orange">0{i + 1}</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────────── TECHNICAL SPECS ───────────── */}
        <section className="border-t border-qubo-line">
          <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:py-20">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-qubo-muted">
              <span className="text-qubo-orange">02</span> — Institutional Technical Specifications
            </div>

            <div className="mt-10 grid gap-px border border-qubo-line bg-qubo-line md:grid-cols-2 xl:grid-cols-4">
              {product.specs.map((g) => (
                <div key={g.title} className="scan-card bg-qubo-card p-7">
                  <span className="draw-line" />
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white">{g.title}</h3>
                  <dl className="mt-6 divide-y divide-qubo-line">
                    {g.rows.map((r) => (
                      <div key={r.label} className="flex flex-col gap-1 py-3.5">
                        <dt className="text-xs text-qubo-muted">{r.label}</dt>
                        <dd className="font-mono text-sm text-white">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── LAUNCH CTA ───────────── */}
        <section className="border-t border-qubo-line">
          <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:py-20">
            <div>
              <h2 className="font-serif text-3xl text-white sm:text-4xl">Enter the {displayName} workspace.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-qubo-muted">
                Authenticated clients can open the live engine console: telemetry, configuration and audit trails in
                one workspace.
              </p>
            </div>
           <a
            href={product.engineUrl}
           target="_blank"
           rel="noopener noreferrer"
           className="group inline-flex items-center gap-3 bg-qubo-orange px-8 py-4 font-mono text-xs uppercase tracking-[0.16em] text-black shadow-[0_0_0_rgba(255,85,0,0)] transition-shadow hover:shadow-[0_0_40px_rgba(255,85,0,0.55)]"
>
  Launch {displayName} Engine Portal
  <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
</a>
          </div>
        </section>

        {/* ───────────── OTHER ENGINES ───────────── */}
        <section className="border-t border-qubo-line">
          <div className="mx-auto grid max-w-[1400px] gap-px bg-qubo-line sm:grid-cols-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/products/${o.slug}`} className="scan-card group bg-qubo-bg px-5 py-10 sm:px-8">
                <span className="draw-line" />
                <div className="font-mono text-[11px] tracking-[0.2em] text-qubo-dim">({o.index})</div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-serif text-3xl text-white group-hover:text-qubo-orange">{o.name}</span>
                  <span className="text-qubo-muted transition-transform group-hover:translate-x-1">→</span>
                </div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-qubo-muted">{o.tagline}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
