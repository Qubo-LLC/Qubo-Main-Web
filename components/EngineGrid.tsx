import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function EngineGrid() {
  return (
    <div className="grid gap-px border border-qubo-line bg-qubo-line md:grid-cols-3">
      {PRODUCTS.map((p) => (
        <article key={p.slug} className="scan-card corner-brackets group flex flex-col bg-qubo-card p-8 sm:p-10">
          <span className="draw-line" />
          {/* Whole-card link (sits under the quick actions) */}
          <Link href={`/products/${p.slug}`} className="absolute inset-0 z-0" aria-label={`Open ${p.name}`} />

          <div className="pointer-events-none relative flex items-start justify-between">
            <span className="font-mono text-[11px] tracking-[0.2em] text-qubo-dim">({p.index})</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-qubo-muted">{p.category}</span>
          </div>

          <h3 className="pointer-events-none relative mt-14 font-serif text-[40px] font-normal leading-none tracking-tight text-white transition-colors group-hover:text-qubo-orange">
            {p.name}
          </h3>
          <p className="pointer-events-none relative mt-3 font-mono text-xs uppercase tracking-[0.14em] text-neutral-300">{p.tagline}</p>
          <p className="pointer-events-none relative mt-6 text-sm leading-relaxed text-qubo-muted">{p.summary}</p>

          <ul className="pointer-events-none relative mt-8 space-y-2.5 border-t border-qubo-line pt-6">
            {p.capabilities.map((c) => (
              <li key={c} className="flex items-center gap-3 text-[13px] text-neutral-300">
                <span className="h-px w-3 bg-qubo-orange" />
                {c}
              </li>
            ))}
          </ul>

          <div className="pointer-events-none relative mt-10">
            <div className="font-serif text-3xl text-white">{p.heroMetric.value}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-qubo-dim">{p.heroMetric.label}</div>
          </div>

          <div className="relative z-10 mt-8 flex gap-2 pt-2">
            <Link
              href={`/products/${p.slug}`}
              className="flex-1 border border-qubo-line px-4 py-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:border-white/40"
            >
              View engine →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
