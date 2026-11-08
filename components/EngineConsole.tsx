"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";

/**
 * Live engine console workspace (simulated). Streams engine logs,
 * shows a latency sparkline and accepts a few commands.
 * Wire this to your real engine APIs / websockets when available.
 */

type Line = { t: string; lvl: "INFO" | "OK" | "WARN" | "CMD"; msg: string };

const LOGS: Record<Product["slug"], string[]> = {
  valtrius: [
    "solver: household {id} converged in {n}ms (12 iters)",
    "tax-lot harvest queued: {id} → $ {k} realized loss",
    "drift breach cleared on {id} (0.6% → 0.1%)",
    "covariance cache refreshed · region EMEA",
  ],
  qubex: [
    "fill {id} t2t={ns}ns venue=NY4",
    "fpga risk gate pass {id} · 42ns",
    "shadow book reconciled · 0 breaks",
    "settlement batch {id} posted to ledger",
  ],
  synatra: [
    "signal α-{id} refreshed · IC {ic}",
    "feature store hot-swap · {n} features",
    "walk-forward fold {n}/12 complete",
    "alt-data vendor sync ok · {k} rows",
  ],
};

const now = () => new Date().toISOString().slice(11, 23);
const fill = (tpl: string) =>
  tpl
    .replace("{id}", Math.floor(Math.random() * 90000 + 10000).toString())
    .replace("{n}", Math.ceil(Math.random() * 20).toString())
    .replace("{k}", (Math.random() * 9000 + 500).toFixed(0))
    .replace("{ns}", Math.round(350 + Math.random() * 70).toString())
    .replace("{ic}", (0.03 + Math.random() * 0.07).toFixed(3));

export default function EngineConsole({ product }: { product: Product }) {
  const [lines, setLines] = useState<Line[]>([
    { t: now(), lvl: "OK", msg: `${product.name} engine session established` },
    { t: now(), lvl: "INFO", msg: "type `help` for available commands" },
  ]);
  const [series, setSeries] = useState<number[]>(() => Array.from({ length: 60 }, () => 50));
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const tpls = LOGS[product.slug];
      setLines((l) => [
        ...l.slice(-200),
        { t: now(), lvl: Math.random() > 0.94 ? "WARN" : "INFO", msg: fill(tpls[Math.floor(Math.random() * tpls.length)]) },
      ]);
      setSeries((s) => [...s.slice(1), Math.max(5, Math.min(95, s[s.length - 1] + (Math.random() - 0.5) * 18 + (50 - s[s.length - 1]) * 0.1))]);
    }, 500);
    return () => window.clearInterval(id);
  }, [paused, product.slug]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines]);

  const run = (cmd: string) => {
    const c = cmd.trim().toLowerCase();
    if (!c) return;
    const out: Line[] = [{ t: now(), lvl: "CMD", msg: `> ${cmd}` }];
    if (c === "help") out.push({ t: now(), lvl: "INFO", msg: "commands: status · pause · resume · clear · specs" });
    else if (c === "status") out.push({ t: now(), lvl: "OK", msg: `${product.name}: ONLINE · ${product.heroMetric.value} ${product.heroMetric.label.toLowerCase()}` });
    else if (c === "pause") { setPaused(true); out.push({ t: now(), lvl: "INFO", msg: "stream paused" }); }
    else if (c === "resume") { setPaused(false); out.push({ t: now(), lvl: "INFO", msg: "stream resumed" }); }
    else if (c === "specs") product.specs.forEach((g) => g.rows.forEach((r) => out.push({ t: now(), lvl: "INFO", msg: `${g.title} · ${r.label}: ${r.value}` })));
    else if (c === "clear") { setLines([]); setInput(""); return; }
    else out.push({ t: now(), lvl: "WARN", msg: `unknown command: ${c}` });
    setLines((l) => [...l, ...out]);
    setInput("");
  };

  const spark = series.map((v, i) => `${(i / (series.length - 1)) * 100},${100 - v}`).join(" ");
  const lvlColor = { INFO: "text-qubo-muted", OK: "text-white", WARN: "text-qubo-orange", CMD: "text-qubo-orange" };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-qubo-line px-5 sm:px-8">
        <Link href={`/products/${product.slug}`} className="font-mono text-[11px] uppercase tracking-[0.16em] text-qubo-muted hover:text-qubo-orange">
          ← {product.name}
        </Link>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
          <span className={`glow-dot h-1.5 w-1.5 rounded-full bg-qubo-orange ${paused ? "" : "animate-pulse"}`} />
          {product.name} · Engine Console
        </div>
        <span className="hidden font-mono text-[11px] text-qubo-dim sm:block">SIMULATED SESSION</span>
      </header>

      <div className="grid flex-1 gap-px bg-qubo-line lg:grid-cols-[1fr_340px]">
        <section className="flex min-h-[60vh] flex-col bg-qubo-bg">
          <div ref={logRef} className="flex-1 overflow-y-auto p-5 font-mono text-[12px] leading-6" style={{ maxHeight: "calc(100vh - 112px)" }}>
            {lines.map((l, i) => (
              <div key={i} className="flex gap-4 whitespace-pre-wrap">
                <span suppressHydrationWarning className="shrink-0 text-qubo-dim">{l.t}</span>
                <span className={`w-10 shrink-0 ${lvlColor[l.lvl]}`}>{l.lvl}</span>
                <span className={l.lvl === "CMD" ? "text-white" : "text-neutral-300"}>{l.msg}</span>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
            }}
            className="flex h-14 items-center gap-3 border-t border-qubo-line px-5 font-mono text-sm"
          >
            <span className="text-qubo-orange">❯</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="help"
              aria-label="Console command"
              className="flex-1 bg-transparent text-white outline-none placeholder:text-qubo-dim"
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </section>

        <aside className="space-y-px bg-qubo-line">
          <div className="bg-qubo-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-qubo-muted">Latency envelope</div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-28 w-full">
              <polyline points={spark} fill="none" stroke="#FF5500" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          {product.specs.slice(0, 2).map((g) => (
            <div key={g.title} className="bg-qubo-card p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-qubo-muted">{g.title}</div>
              <dl className="mt-4 space-y-3">
                {g.rows.map((r) => (
                  <div key={r.label} className="flex justify-between gap-4 text-xs">
                    <dt className="text-qubo-muted">{r.label}</dt>
                    <dd className="text-right font-mono text-white">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
