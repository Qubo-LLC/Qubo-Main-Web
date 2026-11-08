import Link from "next/link";
import { Logo } from "./SiteHeader";

const COLUMNS = [
  {
    title: "Engines",
    links: [
      { label: "Valtrius", href: "/products/valtrius" },
      { label: "Qubex", href: "/products/qubex" },
      { label: "Synatra", href: "/products/synatra" },
    ],
  },
  {
    title: "Infrastructure",
    links: [
      { label: "Co-location", href: "/infrastructure" },
      { label: "Kernel Bypass", href: "/products/qubex" },
      { label: "Data Fabric", href: "/products/synatra" },
    ],
  },
  {
    title: "Firm",
    links: [
      { label: "Quantitative Research", href: "/research" },
      { label: "Governance", href: "/security" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Clients",
    links: [
      { label: "Client Portal ↗", href: "/products/qubex/console" },
      { label: "Security & Trust", href: "/security" },
      { label: "Contact", href: "mailto:contact@qubo.example" /* TODO: replace with your inbox */ },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-qubo-line bg-qubo-bg">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-qubo-muted">
              An integrated quantitative stack connecting research, execution, and liquidity. Engineered in C++,
              governed like an institution.
            </p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-qubo-dim">{c.title}</h3>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-neutral-300 transition-colors hover:text-qubo-orange">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </footer>
  );
}
