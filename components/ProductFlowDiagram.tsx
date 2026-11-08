"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductSlug } from "@/lib/products";

/**
 * Animated, interactive data-flow diagrams — one per engine.
 * Pure SVG + SMIL/CSS animation (no canvas), so they stay crisp, accessible
 * and cheap. Hovering a node isolates its connected paths.
 */

const ORANGE = "#FF5500";
const LINE = "#2A2A34";
const MUTED = "#8A8A96";
const DIM = "#55555F";

// ───────────────────────── shared primitives ─────────────────────────

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id={`${id}-edge`} x1="0" x2="1">
        <stop offset="0" stopColor={ORANGE} stopOpacity="0.05" />
        <stop offset="0.5" stopColor={ORANGE} stopOpacity="0.9" />
        <stop offset="1" stopColor={ORANGE} stopOpacity="0.05" />
      </linearGradient>
      <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity="0.025" />
      </pattern>
    </defs>
  );
}

function Pulse({
  d,
  dur,
  begin,
  r = 3,
  id,
}: {
  d: string;
  dur: number;
  begin: number;
  r?: number;
  id: string;
}) {
  return (
    <circle r={r} fill={ORANGE} filter={`url(#${id}-glow)`}>
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={d} />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.1;0.85;1"
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
};

/** Deterministic pseudo-random (SSR-safe, no hydration mismatch). */
const prand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative overflow-x-auto">
      <svg
        viewBox="0 0 1000 540"
        className="h-auto w-full min-w-[680px] select-none"
        role="img"
        aria-label={label}
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        {children}
      </svg>
    </div>
  );
}

// ───────────────────────── VALTRIUS ─────────────────────────

const V_BUDGETS = [
  { id: "eq", label: "EQUITY RISK", v: "38%" },
  { id: "rt", label: "RATES / DURATION", v: "22%" },
  { id: "cr", label: "CREDIT SPREAD", v: "16%" },
  { id: "fx", label: "FX EXPOSURE", v: "9%" },
  { id: "tx", label: "TAX BUDGET", v: "$4.2k" },
];
const V_ASSETS = [
  { id: "us", label: "US EQUITY", w: 0.34, from: ["eq", "tx"] },
  { id: "ix", label: "INTL EQUITY", w: 0.14, from: ["eq", "fx", "tx"] },
  { id: "ust", label: "TREASURIES", w: 0.2, from: ["rt"] },
  { id: "ig", label: "IG CREDIT", w: 0.12, from: ["cr", "rt"] },
  { id: "mu", label: "MUNICIPALS", w: 0.1, from: ["tx", "rt", "cr"] },
  { id: "al", label: "ALTERNATIVES", w: 0.1, from: ["eq", "cr", "fx"] },
];

function ValtriusDiagram() {
  const id = "val";
  const [active, setActive] = useState<string | null>(null);
  const [weights, setWeights] = useState(V_ASSETS.map((a) => a.w));
  const [iter, setIter] = useState(0);

  // Live rebalancing: weights drift then the optimizer pulls them back to target
  useEffect(() => {
    const t = window.setInterval(() => {
      setIter((i) => i + 1);
      setWeights((prev) => {
        const next = prev.map((w, i) => Math.max(0.03, w + (Math.random() - 0.5) * 0.03 + (V_ASSETS[i].w - w) * 0.35));
        const s = next.reduce((a, b) => a + b, 0);
        return next.map((w) => w / s);
      });
    }, 1400);
    return () => window.clearInterval(t);
  }, []);

  const bY = (i: number) => 90 + i * 92;
  const aY = (i: number) => 70 + i * 82;
  const OPT = { x: 500, y: 270 };

  const inEdges = V_BUDGETS.map((b, i) => ({ id: b.id, d: curve(250, bY(i), OPT.x - 70, OPT.y) }));
  const outEdges = V_ASSETS.map((a, i) => ({ id: a.id, from: a.from, d: curve(OPT.x + 70, OPT.y, 760, aY(i)) }));

  const lit = (budget: string | null, asset: string | null) => {
    if (!active) return true;
    if (budget && active === budget) return true;
    if (asset && active === asset) return true;
    if (budget && V_ASSETS.find((a) => a.id === active)?.from.includes(budget)) return true;
    if (asset && V_ASSETS.find((a) => a.id === asset)?.from.includes(active)) return true;
    return false;
  };

  return (
    <Frame label="Valtrius rebalancing flow: risk budgets through convex optimizer to asset nodes">
      <Defs id={id} />
      <rect width="1000" height="540" fill={`url(#${id}-grid)`} />

      <text x="60" y="40" fill={DIM} fontSize="11" letterSpacing="2.5">RISK BUDGETS · INPUT</text>
      <text x="500" y="40" fill={DIM} fontSize="11" letterSpacing="2.5" textAnchor="middle">CONVEX SOLVER</text>
      <text x="940" y="40" fill={DIM} fontSize="11" letterSpacing="2.5" textAnchor="end">ASSET NODES · TARGET W</text>

      {/* edges */}
      {inEdges.map((e, i) => (
        <g key={e.id} opacity={lit(e.id, null) ? 1 : 0.12} style={{ transition: "opacity 300ms" }}>
          <path d={e.d} fill="none" stroke={LINE} strokeWidth="1.2" />
          <path d={e.d} fill="none" stroke={ORANGE} strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="4 10">
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.2s" repeatCount="indefinite" />
          </path>
          <Pulse id={id} d={e.d} dur={2.2} begin={i * 0.37} />
        </g>
      ))}
      {outEdges.map((e, i) => (
        <g key={e.id} opacity={lit(null, e.id) ? 1 : 0.12} style={{ transition: "opacity 300ms" }}>
          <path d={e.d} fill="none" stroke={LINE} strokeWidth={1 + weights[i] * 10} strokeOpacity="0.7" />
          <path d={e.d} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="1.2" />
          <Pulse id={id} d={e.d} dur={1.8} begin={0.9 + i * 0.29} r={2.5 + weights[i] * 6} />
        </g>
      ))}

      {/* budget nodes */}
      {V_BUDGETS.map((b, i) => (
        <g
          key={b.id}
          transform={`translate(60, ${bY(i) - 24})`}
          onMouseEnter={() => setActive(b.id)}
          onMouseLeave={() => setActive(null)}
          className="cursor-pointer"
          opacity={lit(b.id, null) ? 1 : 0.3}
          style={{ transition: "opacity 300ms" }}
        >
          <rect width="190" height="48" fill="#121216" stroke={active === b.id ? ORANGE : LINE} />
          <text x="14" y="20" fill={MUTED} fontSize="10" letterSpacing="1.5">{b.label}</text>
          <text x="14" y="38" fill="#fff" fontSize="14">{b.v}</text>
          <circle cx="190" cy="24" r="3" fill={ORANGE} />
        </g>
      ))}

      {/* optimizer core */}
      <g transform={`translate(${OPT.x}, ${OPT.y})`}>
        <circle r="110" fill="none" stroke={ORANGE} strokeOpacity="0.08" strokeWidth="1">
          <animate attributeName="r" values="80;125;80" dur="4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.25;0;0.25" dur="4s" repeatCount="indefinite" />
        </circle>
        <polygon
          points="0,-78 68,-39 68,39 0,78 -68,39 -68,-39"
          fill="#121216"
          stroke={ORANGE}
          strokeWidth="1.2"
          filter={`url(#${id}-glow)`}
        />
        <polygon points="0,-58 50,-29 50,29 0,58 -50,29 -50,-29" fill="none" stroke={ORANGE} strokeOpacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="24s" repeatCount="indefinite" />
        </polygon>
        <text y="-8" fill="#fff" fontSize="20" textAnchor="middle">∇ min</text>
        <text y="12" fill={MUTED} fontSize="9" letterSpacing="1.5" textAnchor="middle">wᵀΣw − λμᵀw</text>
        <text y="32" fill={ORANGE} fontSize="9" letterSpacing="1.5" textAnchor="middle">ITER {String(iter).padStart(4, "0")}</text>
      </g>

      {/* asset nodes */}
      {V_ASSETS.map((a, i) => (
        <g
          key={a.id}
          transform={`translate(760, ${aY(i) - 22})`}
          onMouseEnter={() => setActive(a.id)}
          onMouseLeave={() => setActive(null)}
          className="cursor-pointer"
          opacity={lit(null, a.id) ? 1 : 0.3}
          style={{ transition: "opacity 300ms" }}
        >
          <rect width="180" height="44" fill="#121216" stroke={active === a.id ? ORANGE : LINE} />
          <circle cx="0" cy="22" r="3" fill={ORANGE} />
          <text x="14" y="18" fill={MUTED} fontSize="10" letterSpacing="1.5">{a.label}</text>
          <text x="166" y="18" fill="#fff" fontSize="11" textAnchor="end">{(weights[i] * 100).toFixed(1)}%</text>
          <rect x="14" y="28" width="152" height="4" fill="#22222A" />
          <rect x="14" y="28" width={152 * Math.min(1, weights[i] * 2.5)} height="4" fill={ORANGE} style={{ transition: "width 900ms ease" }} />
        </g>
      ))}

      <text x="60" y="525" fill={DIM} fontSize="10" letterSpacing="2">
        DRIFT TOLERANCE ±0.5% · TURNOVER BUDGET 3.1% · TAX-LOT HARVEST ACTIVE
      </text>
    </Frame>
  );
}

// ───────────────────────── QUBEX ─────────────────────────

const Q_TOP = [
  { id: "feed", label: "VENUE FEED", sub: "ITCH / MDP3", ns: "0" },
  { id: "nic1", label: "BYPASS NIC", sub: "ef_vi RX", ns: "+68" },
  { id: "book", label: "SHADOW BOOK", sub: "L3 rebuild", ns: "+112" },
  { id: "core", label: "STRATEGY CORE", sub: "pinned cpu 3", ns: "+96" },
];
const Q_BOT = [
  { id: "risk", label: "FPGA RISK", sub: "inline gate", ns: "+42" },
  { id: "nic2", label: "BYPASS NIC", sub: "ef_vi TX", ns: "+62" },
  { id: "match", label: "VENUE MATCH", sub: "ack / fill", ns: "= 380ns" },
  { id: "ledger", label: "SETTLEMENT LEDGER", sub: "post-trade", ns: "< 9µs" },
];

const SYMS = ["ES", "NQ", "AAPL", "MSFT", "EURUSD", "ZN", "NVDA", "CL", "SPY", "BTC"];

function QubexDiagram() {
  const id = "qbx";
  const [active, setActive] = useState<string | null>(null);
  const [fills, setFills] = useState<{ n: number; sym: string; side: string; qty: number; px: string; t: number }[]>([]);

  useEffect(() => {
    let n = 1000;
    const t = window.setInterval(() => {
      n += 1;
      const sym = SYMS[Math.floor(Math.random() * SYMS.length)];
      setFills((f) =>
        [
          {
            n,
            sym,
            side: Math.random() > 0.5 ? "BUY" : "SELL",
            qty: Math.ceil(Math.random() * 20) * 100,
            px: (100 + Math.random() * 400).toFixed(2),
            t: Math.round(350 + Math.random() * 70),
          },
          ...f,
        ].slice(0, 5),
      );
    }, 700);
    return () => window.clearInterval(t);
  }, []);

  const TY = 150;
  const BY = 360;
  const tx = (i: number) => 60 + i * 230;
  const bx = (i: number) => 60 + i * 230;
  const W = 170;
  const H = 58;

  const node = (n: { id: string; label: string; sub: string; ns: string }, x: number, y: number) => (
    <g
      key={n.id + y}
      transform={`translate(${x}, ${y - H / 2})`}
      onMouseEnter={() => setActive(n.id)}
      onMouseLeave={() => setActive(null)}
      className="cursor-pointer"
    >
      <rect width={W} height={H} fill="#121216" stroke={active === n.id ? ORANGE : LINE} />
      <rect width="3" height={H} fill={ORANGE} opacity={active === n.id ? 1 : 0.5} />
      <text x="14" y="22" fill="#fff" fontSize="11" letterSpacing="1.5">{n.label}</text>
      <text x="14" y="42" fill={MUTED} fontSize="10">{n.sub}</text>
      <text x={W - 10} y="42" fill={ORANGE} fontSize="10" textAnchor="end">{n.ns}{n.ns.startsWith("+") ? "ns" : ""}</text>
    </g>
  );

  // Lane paths
  const topLane = `M${tx(0) + W},${TY} L${tx(3)},${TY}`;
  const drop = `M${tx(3) + W / 2},${TY + H / 2} L${tx(3) + W / 2},${TY + 70} L${bx(0) + W / 2},${TY + 70} L${bx(0) + W / 2},${BY - H / 2}`;
  const botLane = `M${bx(0) + W},${BY} L${bx(3)},${BY}`;

  return (
    <Frame label="Qubex dual-channel execution: market data ingress and order egress through kernel bypass to settlement">
      <Defs id={id} />
      <rect width="1000" height="540" fill={`url(#${id}-grid)`} />

      {/* channel labels */}
      <text x="60" y="80" fill={DIM} fontSize="11" letterSpacing="2.5">CH·A — MARKET DATA INGRESS</text>
      <text x="60" y="290" fill={DIM} fontSize="11" letterSpacing="2.5">CH·B — ORDER EGRESS → POST-TRADE</text>

      {/* bypassed OS kernel band */}
      <g>
        <rect x="40" y="226" width="920" height="40" fill="none" stroke={DIM} strokeDasharray="3 6" />
        <text x="500" y="251" fill={DIM} fontSize="10" letterSpacing="4" textAnchor="middle">
          OS KERNEL / TCP STACK — BYPASSED
        </text>
        <line x1="40" y1="246" x2="960" y2="246" stroke={ORANGE} strokeOpacity="0.15" />
      </g>

      {/* lanes */}
      {[topLane, botLane].map((d, li) => (
        <g key={d}>
          <path d={d} stroke={LINE} strokeWidth="10" strokeOpacity="0.5" fill="none" />
          <path d={d} stroke={ORANGE} strokeWidth="1" strokeOpacity="0.6" fill="none" strokeDasharray="2 8">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.4s" repeatCount="indefinite" />
          </path>
          {Array.from({ length: 6 }).map((_, i) => (
            <Pulse key={i} id={id} d={d} dur={0.9} begin={i * 0.15 + li * 0.07} r={2.5} />
          ))}
        </g>
      ))}
      <path d={drop} stroke={LINE} strokeWidth="1.2" fill="none" />
      <path d={drop} stroke={ORANGE} strokeOpacity="0.5" strokeWidth="1" fill="none" strokeDasharray="3 6">
        <animate attributeName="stroke-dashoffset" from="18" to="0" dur="0.5s" repeatCount="indefinite" />
      </path>
      <Pulse id={id} d={drop} dur={1.1} begin={0} r={3} />
      <Pulse id={id} d={drop} dur={1.1} begin={0.55} r={3} />

      {Q_TOP.map((n, i) => node(n, tx(i), TY))}
      {Q_BOT.map((n, i) => node(n, bx(i), BY))}

      {/* live ledger */}
      <g transform="translate(60, 418)">
        <text x="0" y="14" fill={DIM} fontSize="10" letterSpacing="2.5">LEDGER STREAM</text>
        {fills.map((f, i) => (
          <g key={f.n} transform={`translate(0, ${28 + i * 18})`} opacity={1 - i * 0.18}>
            <text x="0" y="0" fill={i === 0 ? ORANGE : MUTED} fontSize="11">
              {`#${f.n}`}
            </text>
            <text x="80" y="0" fill="#fff" fontSize="11">{f.sym}</text>
            <text x="170" y="0" fill={f.side === "BUY" ? ORANGE : MUTED} fontSize="11">{f.side}</text>
            <text x="240" y="0" fill="#fff" fontSize="11">{f.qty.toLocaleString()}</text>
            <text x="320" y="0" fill="#fff" fontSize="11">@ {f.px}</text>
            <text x="440" y="0" fill={MUTED} fontSize="11">t2t {f.t}ns</text>
            <text x="560" y="0" fill={DIM} fontSize="11">SETTLED · RECONCILED · TREASURY ✓</text>
          </g>
        ))}
      </g>
    </Frame>
  );
}

// ───────────────────────── SYNATRA ─────────────────────────

const S_INPUTS = ["TICK DATA", "ORDER FLOW", "NEWS · NLP", "SATELLITE", "CARD SPEND", "MACRO"];
const S_OUTPUTS = ["α · INTRADAY", "α · SWING", "α · STRATEGIC"];
const S_LAYERS = [S_INPUTS.length, 8, 6, S_OUTPUTS.length];
const S_X = [170, 420, 640, 830];

function SynatraDiagram() {
  const id = "syn";
  const [active, setActive] = useState<string | null>(null);
  const [scores, setScores] = useState([0.62, 0.41, 0.28]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setScores((s) => s.map((v) => Math.min(0.95, Math.max(0.05, v + (Math.random() - 0.5) * 0.12))));
    }, 900);
    return () => window.clearInterval(t);
  }, []);

  const nodes = useMemo(() => {
    const out: { id: string; l: number; i: number; x: number; y: number }[] = [];
    S_LAYERS.forEach((count, l) => {
      const span = 400;
      const gap = span / (count - 1 || 1);
      const top = 270 - span / 2 + (count < 4 ? 80 : 0);
      const g = count < 4 ? (span - 160) / (count - 1) : gap;
      for (let i = 0; i < count; i++) out.push({ id: `${l}-${i}`, l, i, x: S_X[l], y: top + i * g });
    });
    return out;
  }, []);

  const edges = useMemo(() => {
    const out: { a: string; b: string; d: string; k: number; w: number }[] = [];
    let k = 0;
    for (let l = 0; l < S_LAYERS.length - 1; l++) {
      const A = nodes.filter((n) => n.l === l);
      const B = nodes.filter((n) => n.l === l + 1);
      A.forEach((a) =>
        B.forEach((b) => {
          k += 1;
          out.push({ a: a.id, b: b.id, d: curve(a.x, a.y, b.x, b.y), k, w: prand(k) });
        }),
      );
    }
    return out;
  }, [nodes]);

  const isLit = (e: { a: string; b: string }) => !active || e.a === active || e.b === active;
  const pulseEdges = edges.filter((e) => (active ? isLit(e) : e.w > 0.78));

  return (
    <Frame label="Synatra neural signal matrix: alternative data through feature extraction layers to alpha signals">
      <Defs id={id} />
      <rect width="1000" height="540" fill={`url(#${id}-grid)`} />

      {["RAW INPUTS", "FEATURE EXTRACTION", "REPRESENTATION", "ALPHA SIGNALS"].map((t, i) => (
        <text key={t} x={S_X[i]} y="40" fill={DIM} fontSize="10" letterSpacing="2.5" textAnchor="middle">
          {t}
        </text>
      ))}

      {/* activation waves sweeping across layers */}
      {S_X.map((x, i) => (
        <rect key={x} x={x - 50} y="60" width="100" height="440" fill={ORANGE} opacity="0">
          <animate
            attributeName="opacity"
            values="0;0.06;0"
            dur="2.4s"
            begin={`${i * 0.45}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}

      {/* edges */}
      {edges.map((e) => (
        <path
          key={e.k}
          d={e.d}
          fill="none"
          stroke={isLit(e) && active ? ORANGE : "#ffffff"}
          strokeOpacity={active ? (isLit(e) ? 0.55 : 0.02) : 0.035 + e.w * 0.07}
          strokeWidth={active && isLit(e) ? 1.1 : 0.8}
          style={{ transition: "stroke-opacity 250ms" }}
        />
      ))}

      {/* pulses */}
      {pulseEdges.slice(0, 40).map((e, i) => (
        <Pulse key={`${e.k}-${active ?? "x"}`} id={id} d={e.d} dur={1.4 + prand(e.k + 7) * 0.8} begin={(i % 10) * 0.22} r={2.2} />
      ))}

      {/* neurons */}
      {nodes.map((n) => {
        const on = active === n.id;
        const r = n.l === 0 || n.l === 3 ? 8 : 6;
        return (
          <g
            key={n.id}
            onMouseEnter={() => setActive(n.id)}
            onMouseLeave={() => setActive(null)}
            className="cursor-pointer"
          >
            <circle cx={n.x} cy={n.y} r="16" fill="transparent" />
            <circle cx={n.x} cy={n.y} r={r + 6} fill="none" stroke={ORANGE} strokeOpacity="0">
              <animate
                attributeName="stroke-opacity"
                values="0;0.5;0"
                dur="2.4s"
                begin={`${n.l * 0.45 + n.i * 0.05}s`}
                repeatCount="indefinite"
              />
              <animate attributeName="r" values={`${r};${r + 10};${r}`} dur="2.4s" begin={`${n.l * 0.45 + n.i * 0.05}s`} repeatCount="indefinite" />
            </circle>
            <circle
              cx={n.x}
              cy={n.y}
              r={r}
              fill={on ? ORANGE : "#121216"}
              stroke={ORANGE}
              strokeWidth={on ? 2 : 1.2}
              filter={on ? `url(#${id}-glow)` : undefined}
            />
            {n.l === 0 && (
              <text x={n.x - 20} y={n.y + 4} fill={on ? "#fff" : MUTED} fontSize="10" letterSpacing="1.5" textAnchor="end">
                {S_INPUTS[n.i]}
              </text>
            )}
            {n.l === 3 && (
              <g>
                <text x={n.x + 20} y={n.y - 4} fill="#fff" fontSize="11" letterSpacing="1.5">
                  {S_OUTPUTS[n.i]}
                </text>
                <rect x={n.x + 20} y={n.y + 4} width="110" height="4" fill="#22222A" />
                <rect x={n.x + 20} y={n.y + 4} width={110 * scores[n.i]} height="4" fill={ORANGE} style={{ transition: "width 700ms ease" }} />
                <text x={n.x + 136} y={n.y + 10} fill={ORANGE} fontSize="10">
                  {(scores[n.i] * 2 - 1 >= 0 ? "+" : "") + (scores[n.i] * 2 - 1).toFixed(2)}σ
                </text>
              </g>
            )}
          </g>
        );
      })}

      <text x="60" y="525" fill={DIM} fontSize="10" letterSpacing="2">
        ENSEMBLE 640 · WALK-FORWARD IC 0.071 · DECAY HALF-LIFE MODELLED PER SIGNAL
      </text>
    </Frame>
  );
}

// ───────────────────────── export ─────────────────────────

export default function ProductFlowDiagram({ slug }: { slug: ProductSlug }) {
  if (slug === "valtrius") return <ValtriusDiagram />;
  if (slug === "qubex") return <QubexDiagram />;
  return <SynatraDiagram />;
}
