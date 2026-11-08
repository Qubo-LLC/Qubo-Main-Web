"use client";

import { useEffect, useRef } from "react";

/**
 * Global ambient layer.
 *  - Micro-particle field on a 2D canvas that warps and deflects
 *    away from the cursor, scaled by cursor velocity.
 *  - Radial cursor aura (rgba(255,85,0,0.12)) that eases toward the pointer.
 * Both layers are fixed, transparent and ignore pointer events.
 */

interface Particle {
  x: number;
  y: number;
  ox: number; // origin (home) position
  oy: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  hot: boolean;
}

const INFLUENCE_RADIUS = 160;
const SPRING = 0.012;
const DAMPING = 0.9;

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const aura = auraRef.current;
    if (!canvas || !aura) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;

    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, speed: 0 };
    const auraPos = { x: window.innerWidth / 2, y: window.innerHeight / 3 };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Jittered lattice → reads as a matrix, but never perfectly rigid
      const spacing = width < 768 ? 46 : 38;
      particles = [];
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          const jx = x + (Math.random() - 0.5) * spacing * 0.6;
          const jy = y + (Math.random() - 0.5) * spacing * 0.6;
          particles.push({
            x: jx,
            y: jy,
            ox: jx,
            oy: jy,
            vx: 0,
            vy: 0,
            r: Math.random() * 0.9 + 0.4,
            a: Math.random() * 0.35 + 0.1,
            hot: Math.random() < 0.06,
          });
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const frame = () => {
      // Cursor velocity (smoothed)
      if (mouse.px > -9000) {
        const dvx = mouse.x - mouse.px;
        const dvy = mouse.y - mouse.py;
        mouse.vx = mouse.vx * 0.8 + dvx * 0.2;
        mouse.vy = mouse.vy * 0.8 + dvy * 0.2;
      }
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.speed = Math.min(Math.hypot(mouse.vx, mouse.vy), 60);

      // Aura easing
      if (mouse.x > -9000) {
        auraPos.x += (mouse.x - auraPos.x) * 0.12;
        auraPos.y += (mouse.y - auraPos.y) * 0.12;
        aura.style.opacity = "1";
      } else {
        aura.style.opacity = "0";
      }
      aura.style.transform = `translate3d(${auraPos.x - 300}px, ${auraPos.y - 300}px, 0)`;

      ctx.clearRect(0, 0, width, height);

      const force = 0.6 + mouse.speed * 0.09; // faster cursor → stronger deflection
      const r2 = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;

        let glow = 0;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1;
          const falloff = 1 - d / INFLUENCE_RADIUS;
          // Radial push + a tangential drag along cursor motion (warp)
          p.vx += (dx / d) * falloff * force + mouse.vx * falloff * 0.04;
          p.vy += (dy / d) * falloff * force + mouse.vy * falloff * 0.04;
          glow = falloff;
        }

        // Spring back to origin
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = Math.min(1, p.a + glow * 0.7);
        if (p.hot || glow > 0.05) {
          ctx.fillStyle = `rgba(255, 85, 0, ${p.hot ? Math.max(alpha, 0.45) : alpha})`;
        } else {
          ctx.fillStyle = `rgba(200, 200, 210, ${alpha * 0.55})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glow * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    build();
    if (reduceMotion) {
      // Draw a single static frame
      mouse.x = -9999;
      frame();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={auraRef}
        className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,85,0,0.12) 0%, rgba(255,85,0,0.05) 35%, rgba(255,85,0,0) 70%)",
        }}
      />
    </div>
  );
}
