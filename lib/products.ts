export type ProductSlug = "valtrius" | "qubex" | "synatra";

export interface SpecGroup {
  title: string;
  rows: { label: string; value: string }[];
}

export interface Product {
  slug: ProductSlug;
  index: string;
  name: string;
  tagline: string;
  category: string;
  summary: string;
  description: string;
  capabilities: string[];
  heroMetric: { value: string; label: string };
  flowTitle: string;
  flowCaption: string;
  specs: SpecGroup[];
  engineUrl: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "valtrius",
    index: "01",
    name: "VALTRIUS",
    tagline: "Wealth & Portfolio Engineering",
    engineUrl: "https://qubo-valtrius.duckdns.org/",
    category: "Autonomous Wealth Engine",
    summary:
      "Autonomous individual wealth engines with convex portfolio construction and tax/risk budget optimization.",
    description:
      "Valtrius replaces rule-based advisory logic with a continuous optimization kernel. Every account is a live portfolio problem: risk budgets, tax lots, liquidity needs and mandate constraints are solved jointly, then rebalanced through minimum-drift vectors.",
    capabilities: [
      "Convex risk-budget allocation",
      "Tax-lot aware rebalancing",
      "Direct indexing at account scale",
      "Mandate & suitability guardrails",
    ],
    heroMetric: { value: "1.2M", label: "Portfolios optimized / night" },
    flowTitle: "Rebalancing Vector Field",
    flowCaption:
      "Risk budgets resolve through the convex optimizer into rebalancing vectors that flow into asset nodes. Hover a node to trace its allocation path.",
    specs: [
      {
        title: "Latency Profile",
        rows: [
          { label: "Single-account solve", value: "4.1 ms p50" },
          { label: "Household re-optimization", value: "18 ms p99" },
          { label: "Full-book nightly run", value: "< 22 min" },
        ],
      },
      {
        title: "Memory Footprint",
        rows: [
          { label: "Per-account state", value: "48 KB" },
          { label: "Covariance cache", value: "3.2 GB / region" },
          { label: "Solver working set", value: "128 MB / core" },
        ],
      },
      {
        title: "Coverage",
        rows: [
          { label: "Asset universe", value: "41,000+ instruments" },
          { label: "Tax jurisdictions", value: "US · UK · EU · KE" },
          { label: "Custodian links", value: "14 prime / custody" },
        ],
      },
      {
        title: "Audit Trail",
        rows: [
          { label: "Decision lineage", value: "Per-trade rationale" },
          { label: "Retention", value: "7 years, WORM" },
          { label: "Model governance", value: "Versioned & signed" },
        ],
      },
    ],
  },
  {
    slug: "qubex",
    index: "02",
    name: "QUBEX",
    tagline: "Microsecond Execution & Operations Fabric",
    engineUrl: "https://qubo-qubex.duckdns.org/",
    category: "Unified Execution Kernel",
    summary:
      "Kernel-bypass order routing, shadow order book, post-trade settlement, treasury automation and multi-strategy fund operations.",
    description:
      "Qubex unifies the HFT execution engine and fund operations into one fabric. Orders leave strategy memory through a kernel-bypass NIC path, are risk-checked inline in hardware, mirrored into a shadow order book, and settle into a deterministic post-trade ledger without a batch hop.",
    capabilities: [
      "Kernel-bypass routing (DPDK / ef_vi)",
      "Inline FPGA pre-trade risk",
      "Shadow order book reconciliation",
      "Treasury & settlement automation",
    ],
    heroMetric: { value: "380ns", label: "Tick-to-trade, p50" },
    flowTitle: "Dual-Channel Execution Pulse",
    flowCaption:
      "Market data and order flow travel on independent channels: ingress through kernel bypass into the matching path, egress straight into the settlement ledger.",
    specs: [
      {
        title: "Latency Profile",
        rows: [
          { label: "Tick-to-trade", value: "380 ns p50 / 610 ns p99" },
          { label: "Pre-trade risk check", value: "42 ns (FPGA)" },
          { label: "Fill → ledger", value: "< 9 µs" },
        ],
      },
      {
        title: "Memory Footprint",
        rows: [
          { label: "Order book per venue", value: "64 MB hugepages" },
          { label: "Hot path allocations", value: "Zero (arena)" },
          { label: "Ring buffer depth", value: "2^20 slots" },
        ],
      },
      {
        title: "Co-location Coverage",
        rows: [
          { label: "Equities", value: "NY4 · Carteret · Mahwah" },
          { label: "Derivatives", value: "Aurora · LD4 · FR2" },
          { label: "FX / Digital", value: "LD4 · TY3 · SG1" },
        ],
      },
      {
        title: "Audit Trail",
        rows: [
          { label: "Timestamping", value: "PTP, ±20 ns" },
          { label: "Regulatory", value: "CAT · MiFID II RTS 25" },
          { label: "Order lifecycle", value: "Full replay capture" },
        ],
      },
    ],
  },
  {
    slug: "synatra",
    index: "03",
    name: "SYNATRA",
    tagline: "Predictive Machine Learning Alpha",
    engineUrl: "https://qubo-synatra.duckdns.org/",
    category: "Alpha Intelligence Engine",
    summary:
      "Predictive alpha signals, alternative data processing and machine learning intelligence across horizons.",
    description:
      "Synatra ingests structured market microstructure alongside alternative data — text, satellite, transactional — and extracts features through a stacked representation network. Signals are decay-modelled, capacity-tested and published directly into Qubex and Valtrius.",
    capabilities: [
      "Alternative data ingestion",
      "Learned feature extraction",
      "Signal decay & capacity modelling",
      "Walk-forward validation harness",
    ],
    heroMetric: { value: "2.4k", label: "Live signals in production" },
    flowTitle: "Neural Signal Matrix",
    flowCaption:
      "Raw inputs propagate through feature extraction layers. Pulse waves show activation flowing toward the final alpha signals. Hover a neuron to isolate its paths.",
    specs: [
      {
        title: "Latency Profile",
        rows: [
          { label: "Online inference", value: "11 µs p50 (GPU)" },
          { label: "Feature refresh", value: "250 µs – 1 day" },
          { label: "Signal publish", value: "< 2 µs to Qubex" },
        ],
      },
      {
        title: "Memory Footprint",
        rows: [
          { label: "Feature store (hot)", value: "1.8 TB in-memory" },
          { label: "Model ensemble", value: "640 models" },
          { label: "Training corpus", value: "9.4 PB" },
        ],
      },
      {
        title: "Data Coverage",
        rows: [
          { label: "Market data", value: "Tick-level, 38 venues" },
          { label: "Alternative sets", value: "120+ vendors" },
          { label: "History", value: "Since 1998" },
        ],
      },
      {
        title: "Audit Trail",
        rows: [
          { label: "Model lineage", value: "Data → weights → signal" },
          { label: "Reproducibility", value: "Hash-pinned datasets" },
          { label: "Review", value: "Independent model risk" },
        ],
      },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
