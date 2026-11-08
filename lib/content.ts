/** Site-wide editorial content. Figures are illustrative placeholders — edit before launch. */

export const NAV = [
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Infrastructure", href: "/infrastructure" },
  { label: "Quantitative Research", href: "/research" },
  { label: "Security", href: "/security" },
  { label: "Careers", href: "/careers" },
] as const;

export const METRICS = [
  { value: "380", unit: "ns", label: "Median tick-to-trade" },
  { value: "42", unit: "ns", label: "Inline FPGA risk check" },
  { value: "2", unit: "", label: "Google Cloud servers" },
  { value: "2.4", unit: "k", label: "Live Synatra signals" },
  { value: "1.2", unit: "M", label: "Portfolios optimized nightly" },
  { value: "99.9997", unit: "%", label: "Execution fabric uptime" },
];

export const INFRA_LAYERS = [
  {
    code: "L0",
    title: "Network & Silicon",
    body: "Kernel-bypass NICs, FPGA risk gates and PTP-disciplined clocks across metro fibre and microwave links.",
    stat: "±20ns clock sync",
    detail: ["Solarflare / AMD X3 NICs", "Xilinx UltraScale+ risk gates", "Google Cloud · Nairobi + South Africa", "White Rabbit / PTP grandmasters"],
  },
  {
    code: "L1",
    title: "C++ Execution Kernel",
    body: "Lock-free, allocation-free hot paths in modern C++. Arena memory, pinned cores and deterministic replay.",
    stat: "0 hot-path allocs",
    detail: ["C++23, -O3, LTO, PGO", "Isolated & pinned cores", "Hugepage arenas", "Deterministic event replay"],
  },
  {
    code: "L2",
    title: "Data & Feature Fabric",
    body: "Tick-level market data and 120+ alternative datasets unified in a versioned, in-memory feature store.",
    stat: "1.8 TB hot store",
    detail: ["Tick capture since 1998", "120+ alt-data vendors", "Hash-pinned datasets", "Point-in-time joins"],
  },
  {
    code: "L3",
    title: "Portfolio & Operations",
    body: "Convex optimizers, shadow books, treasury and settlement — one ledger from signal to statement.",
    stat: "< 9µs fill → ledger",
    detail: ["Convex risk solvers", "Shadow order books", "Treasury automation", "Real-time P&L and NAV"],
  },
];

export const SERVERS = [
  { name: "QUBO-NBO-01", provider: "Google Cloud", location: "Nairobi, Kenya", status: "Online" },
  { name: "QUBO-ZA-01", provider: "Google Cloud", location: "South Africa", status: "Online" },
];

export const RESEARCH = [
  {
    tag: "Microstructure",
    title: "Queue position as a priced option in fragmented order books",
    meta: "Working Paper · 2026",
    abstract: "We value resting queue priority as an American option on adverse selection and show how routing decisions change when it is priced explicitly.",
  },
  {
    tag: "Machine Learning",
    title: "Decay-aware ensembles for non-stationary alpha signals",
    meta: "Research Note · 2026",
    abstract: "Ensemble weights that adapt to each signal's measured half-life outperform static stacking in walk-forward tests across 38 venues.",
  },
  {
    tag: "Portfolio Theory",
    title: "Tax-lot geometry in high-dimensional convex rebalancing",
    meta: "Working Paper · 2025",
    abstract: "Treating tax lots as a polytope constraint keeps rebalancing convex and cuts realized gains without increasing tracking error.",
  },
  {
    tag: "Systems",
    title: "Tail latency under contention: lessons from 10¹² messages",
    meta: "Engineering Note · 2025",
    abstract: "What actually moves p99.9 in a kernel-bypass stack: cache-line false sharing, NIC interrupt coalescing and clock discipline.",
  },
];

export const RESEARCH_AREAS = [
  { area: "Market Microstructure", desc: "Order book dynamics, queue models, venue toxicity and optimal execution." },
  { area: "Statistical Learning", desc: "Representation learning, signal decay, capacity and robust validation." },
  { area: "Portfolio Construction", desc: "Convex optimization, risk budgeting, tax-aware and multi-period problems." },
  { area: "Low-Latency Systems", desc: "Hardware acceleration, deterministic runtimes and measurement science." },
];

export const GOVERNANCE = [
  { k: "Model Risk", v: "Independent validation of every model before capital allocation, with signed, versioned artefacts." },
  { k: "Security", v: "Zero-trust segmentation, HSM-backed keys and hardware-attested build pipelines for every binary." },
  { k: "Compliance", v: "CAT and MiFID II RTS 25 time-stamping, full order lifecycle capture and 7-year WORM retention." },
  { k: "Resilience", v: "Active-active regions, deterministic replay and kill-switch hierarchy enforced in hardware." },
];

export const SECURITY_CONTROLS = [
  { control: "Identity", detail: "Hardware security keys for every operator; no shared or standing privileged credentials." },
  { control: "Network", detail: "Zero-trust segmentation between research, execution and operations enclaves." },
  { control: "Supply chain", detail: "Reproducible builds, signed artefacts and attested deployment to production hosts." },
  { control: "Data", detail: "Encryption at rest and in transit, HSM-held keys, client data isolated per mandate." },
  { control: "Monitoring", detail: "24/7 security operations with immutable audit logs and tested incident playbooks." },
  { control: "Kill switches", detail: "Layered strategy, desk and firm-wide halts enforced in hardware, independent of software." },
];

export const FRAMEWORKS = ["SOC 2 Type II", "ISO/IEC 27001", "SEC Rule 15c3-5", "MiFID II RTS 6 & 25", "FINRA CAT", "GDPR"];

export const ROLES = [
  { title: "Low-Latency C++ Engineer", team: "Qubex", location: "Nairobi", type: "Full-time · On-site" },
  { title: "FPGA / Hardware Engineer", team: "Qubex", location: "Nairobi", type: "Full-time · On-site" },
  { title: "Quantitative Researcher, Alpha", team: "Synatra", location: "Nairobi", type: "Full-time · On-site" },
  { title: "Machine Learning Engineer", team: "Synatra", location: "Nairobi", type: "Full-time · On-site" },
  { title: "Portfolio Optimization Researcher", team: "Valtrius", location: "Nairobi", type: "Full-time · On-site" },
  { title: "Site Reliability Engineer", team: "Infrastructure", location: "Nairobi", type: "Full-time · On-site" },
];

export const PRINCIPLES = [
  { k: "Measure everything", v: "Claims about speed or alpha are settled by data, not seniority." },
  { k: "Own the stack", v: "Engineers reach from silicon to strategy. No layer is someone else's problem." },
  { k: "Small, senior teams", v: "Few people, high trust, short paths from idea to production." },
];
