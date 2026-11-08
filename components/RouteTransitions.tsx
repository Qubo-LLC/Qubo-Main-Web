"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Smooth page-to-page transitions for the App Router.
 *  1. Intercepts clicks on internal links (capture phase).
 *  2. Plays a short "leave" animation on the current page and starts an
 *     orange progress line at the top of the viewport.
 *  3. Navigates; the new page plays its "enter" animation (see app/template.tsx)
 *     and the progress line completes.
 * Modifier-clicks, new-tab links, hash links, same-page links and reduced
 * motion all fall through to normal navigation.
 */

const LEAVE_MS = 260;

export default function RouteTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const pending = useRef<number | null>(null);
  const failSafe = useRef<number | null>(null);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || /^(mailto:|tel:|https?:)/.test(raw)) return;

      const url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathRef.current) return; // same page: let it scroll normally
      if (reduce.matches) return;

      e.preventDefault();
      e.stopPropagation();

      root.classList.add("route-leaving");
      barRef.current?.setAttribute("data-state", "loading");

      if (pending.current) window.clearTimeout(pending.current);
      pending.current = window.setTimeout(() => {
        router.push(url.pathname + url.search + url.hash);
      }, LEAVE_MS);

      // Never leave the page faded out if navigation stalls
      if (failSafe.current) window.clearTimeout(failSafe.current);
      failSafe.current = window.setTimeout(() => {
        root.classList.remove("route-leaving");
        barRef.current?.setAttribute("data-state", "idle");
      }, 4000);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // New route committed: drop the leave state before paint, finish the bar
  useLayoutEffect(() => {
    document.documentElement.classList.remove("route-leaving");
    if (failSafe.current) window.clearTimeout(failSafe.current);
    const bar = barRef.current;
    if (bar && bar.getAttribute("data-state") === "loading") {
      bar.setAttribute("data-state", "done");
      const t = window.setTimeout(() => bar.setAttribute("data-state", "idle"), 500);
      return () => window.clearTimeout(t);
    }
  }, [pathname]);

  return <div ref={barRef} data-state="idle" aria-hidden className="route-progress" />;
}
