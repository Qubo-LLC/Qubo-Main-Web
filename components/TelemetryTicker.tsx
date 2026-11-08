"use client";

import { useEffect, useState } from "react";

/**
 * Real-time (simulated) telemetry feed. Values random-walk inside realistic
 * bands and refresh every 500ms. The strip scrolls continuously; values are
 * rendered twice so the CSS marquee loops seamlessly.
 */

interface Metric {
  key: string;
  label: string;
  unit: string;
  base: number;
  jitter: number;
  min: number;
  max: number;
  digits: number;
}

const METRICS: Metric[] = [
  { key: "t2t", label: "TICK-TO-TRADE", unit: "ns", base: 380, jitter: 14, min: 352, max: 418, digits: 0 },
  { key: "risk", label: "PRE-TRADE RISK", unit: "ns", base: 42, jitter: 2, min: 38, max: 49, digits: 0 },
  { key: "mem", label: "MEM THROUGHPUT", unit: "GB/s", base: 184.2, jitter: 3.1, min: 170, max: 199, digits: 1 },
  { key: "msgs", label: "MSG RATE", unit: "M/s", base: 12.8, jitter: 0.6, min: 10.5, max: 15, digits: 2 },
  { key: "checks", label: "RISK CHECKS", unit: "/s", base: 2_412_880, jitter: 42_000, min: 2_200_000, max: 2_650_000, digits: 0 },
  { key: "fill", label: "FILL RATIO", unit: "%", base: 97.42, jitter: 0.18, min: 96.5, max: 98.9, digits: 2 },
  { key: "jit", label: "WIRE JITTER", unit: "ns", base: 6.1, jitter: 0.5, min: 4.8, max: 8.2, digits: 1 },
  { key: "sig", label: "SYNATRA SIGNALS", unit: "live", base: 2417, jitter: 6, min: 2380, max: 2460, digits: 0 },
  { key: "aum", label: "VALTRIUS REBAL", unit: "acct/s", base: 1840, jitter: 90, min: 1500, max: 2200, digits: 0 },
];

type Values = Record<string, { v: number; up: boolean }>;

const initial = (): Values =>
  Object.fromEntries(METRICS.map((m) => [m.key, { v: m.base, up: true }]));

function format(m: Metric, v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: m.digits,
    maximumFractionDigits: m.digits,
  });
}

export default function TelemetryTicker() {
  const [values, setValues] = useState<Values>(initial);

  useEffect(() => {
    const id = window.setInterval(() => {
      setValues((prev) => {
        const next: Values = {};
        for (const m of METRICS) {
          const cur = prev[m.key].v;
          // mean-reverting random walk
          const drift = (m.base - cur) * 0.15;
          const step = (Math.random() - 0.5) * 2 * m.jitter + drift;
          const v = Math.min(m.max, Math.max(m.min, cur + step));
          next[m.key] = { v, up: v >= cur };
        }
        return next;
      });
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const items = METRICS.map((m) => {
    const { v, up } = values[m.key];
    return (
      <span key={m.key} className="flex shrink-0 items-center gap-3 px-6">
        <span className="text-qubo-dim">{m.label}</span>
        <span className="tabular-nums text-white">{format(m, v)}</span>
        <span className="text-qubo-dim">{m.unit}</span>
        <span className={up ? "text-qubo-orange" : "text-neutral-500"} aria-hidden>
          {up ? "▲" : "▼"}
        </span>
        <span className="ml-3 h-3 w-px bg-qubo-line" aria-hidden />
      </span>
    );
  });

  return (
    <div className="relative flex h-10 items-center overflow-hidden border-y border-qubo-line bg-qubo-bg font-mono text-[11px] tracking-[0.12em]">
      <div className="z-10 flex h-full shrink-0 items-center gap-2 border-r border-qubo-line bg-qubo-bg px-4 text-qubo-orange">
        <span className="glow-dot h-1.5 w-1.5 animate-pulse rounded-full bg-qubo-orange" />
        LIVE
      </div>
      <div className="relative flex-1 overflow-hidden" aria-live="off">
        <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
          {items}
          <span aria-hidden className="flex">{items}</span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-qubo-bg to-transparent" />
      </div>
    </div>
  );
}
