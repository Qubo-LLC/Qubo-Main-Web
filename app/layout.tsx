import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import ParticleBackground from "@/components/ParticleBackground";
import SiteHeader from "@/components/SiteHeader";
import RouteTransitions from "@/components/RouteTransitions";
import "./globals.css";

/*
 * Institutional type system
 *  - Source Serif 4: editorial serif for headlines (the tone of annual reports and research)
 *  - IBM Plex Sans: neutral, highly legible body / UI sans
 *  - JetBrains Mono: technical telemetry
 */
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QUBO — Quantitative Technology & Liquidity",
    template: "%s · QUBO",
  },
  description:
    "C++ latency engineering, Synatra AI, Valtrius wealth optimization, and Qubex central execution. An integrated quantitative stack connecting research, execution, and liquidity.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${jetbrains.variable}`}
    >
      <body className="relative min-h-screen bg-qubo-bg font-sans text-white antialiased">
        {/* Global ambient layer: particle physics + cursor aura (fixed, pointer-events: none) */}
        <ParticleBackground />
        <RouteTransitions />
        <div className="relative z-10">
          {/* Header persists across routes so its indicator can slide between pages */}
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
