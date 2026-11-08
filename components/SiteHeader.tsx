"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/content";

export function Logo() {
  return (
    <Link href="/" className="group flex items-baseline gap-[2px] font-serif text-[26px] font-semibold tracking-[0.02em] text-white">
      QUBO
      <span className="glow-dot inline-block h-[7px] w-[7px] translate-y-[-1px] rounded-full bg-qubo-orange transition-transform group-hover:scale-125" />
    </Link>
  );
}

/** Which nav item a path belongs to (engine pages live under Ecosystem). */
function sectionFor(pathname: string): string | null {
  if (pathname.startsWith("/products/")) return "/ecosystem";
  return NAV.some((n) => n.href === pathname) ? pathname : null;
}

/**
 * Global header — mounted once in the root layout so it persists across
 * navigations. Its look is derived from the route:
 *  - "/"             transparent over the full-bleed hero until scrolled
 *  - "/products/x"   shows "← Back to Architecture Overview"
 *  - ".../console"   hidden (the console has its own workspace bar)
 * An orange indicator slides between nav items on hover and on navigation.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const transparent = pathname === "/";
  const backLink = pathname.startsWith("/products/") && !pathname.endsWith("/console");
  const hidden = pathname.endsWith("/console");
  const active = sectionFor(pathname);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [bar, setBar] = useState({ left: 0, width: 0, visible: false });

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Header fill on scroll (home only)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close the mobile menu whenever the route changes
  useEffect(() => setMenuOpen(false), [pathname]);

  // Sliding indicator: follows hover, otherwise rests on the active section
  const place = useCallback(() => {
    const key = hovered ?? active;
    const el = key ? linkRefs.current[key] : null;
    const nav = navRef.current;
    if (!el || !nav) {
      setBar((b) => ({ ...b, visible: false }));
      return;
    }
    setBar({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
  }, [hovered, active]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    window.addEventListener("resize", place);
    // fonts can shift link widths after load
    document.fonts?.ready.then(place).catch(() => {});
    return () => window.removeEventListener("resize", place);
  }, [place]);

  if (hidden) return null;

  const solid = !transparent || scrolled || menuOpen;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
        solid ? "border-qubo-line bg-qubo-bg/85 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <Link
            href="/ecosystem"
            aria-hidden={!backLink}
            tabIndex={backLink ? 0 : -1}
            className={`hidden items-center gap-2 border-l border-qubo-line pl-6 font-mono text-[11px] uppercase tracking-[0.18em] text-qubo-muted transition-all duration-500 hover:text-qubo-orange sm:flex ${
              backLink ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            <span aria-hidden>←</span> Back to Architecture Overview
          </Link>
        </div>

        <nav
          ref={navRef}
          aria-label="Primary"
          className="relative hidden items-center gap-8 lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV.map((n) => {
            const isActive = active === n.href;
            return (
              <Link
                key={n.label}
                href={n.href}
                ref={(el: HTMLAnchorElement | null) => {
                  linkRefs.current[n.href] = el;
                }}
                onMouseEnter={() => setHovered(n.href)}
                onFocus={() => setHovered(n.href)}
                onBlur={() => setHovered(null)}
                aria-current={pathname === n.href ? "page" : undefined}
                className={`py-1 text-[13px] transition-colors duration-300 hover:text-white ${
                  isActive ? "text-white" : "text-neutral-300"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          {/* the sliding indicator */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-0.5 h-px bg-qubo-orange shadow-[0_0_8px_rgba(255,85,0,0.8)] transition-[left,width,opacity] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ left: bar.left, width: bar.width, opacity: bar.visible ? 1 : 0 }}
          />
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/products/qubex/console"
            className="border border-white/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition-all hover:border-qubo-orange hover:text-qubo-orange hover:shadow-[0_0_20px_rgba(255,85,0,0.25)]"
          >
            Client Portal ↗
          </Link>

          {/* Mobile menu */}
          <div className="relative lg:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center border border-qubo-line text-white"
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 top-0 h-px w-4 bg-white transition-transform duration-300 ${menuOpen ? "translate-y-[5.5px] rotate-45" : ""}`} />
                <span className={`absolute left-0 top-1/2 h-px w-4 bg-white transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-4 bg-white transition-transform duration-300 ${menuOpen ? "-translate-y-[5.5px] -rotate-45" : ""}`} />
              </span>
            </button>
            <div
              id="mobile-menu"
              className={`absolute right-0 top-12 w-64 origin-top-right border border-qubo-line bg-qubo-card p-2 transition-all duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                menuOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.98] opacity-0"
              }`}
            >
              {backLink && (
                <Link href="/ecosystem" className="block px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-qubo-orange">
                  ← Back to Architecture Overview
                </Link>
              )}
              {NAV.map((n, i) => (
                <Link
                  key={n.label}
                  href={n.href}
                  style={{ transitionDelay: menuOpen ? `${60 + i * 35}ms` : "0ms" }}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm transition-all duration-300 hover:bg-white/5 hover:text-white ${
                    menuOpen ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                  } ${active === n.href ? "text-white" : "text-neutral-300"}`}
                >
                  {n.label}
                  {active === n.href && <span className="h-1.5 w-1.5 rounded-full bg-qubo-orange" />}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
