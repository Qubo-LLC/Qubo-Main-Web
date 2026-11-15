"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createRenderer } from "./webgl";

/**
 * Black hole — top-down (face-on) view, rendered in one fragment shader.
 *  - Pure black event horizon ringed by one crisp photon ring
 *  - Face-on accretion disk: domain-warped turbulence, orbital filaments,
 *    dark dust lanes, a thin hot inner rim, orbiting sparks and plunging
 *    streams, all sheared at Keplerian speed (ω ∝ r^-1.5). Glow is kept low
 *    so the rings around the core stay sharp.
 *  - Warped spacetime grid: log-spaced rings flowing inward, radial lines twisted
 *    by frame dragging
 *  - Three orbiting probes with light trails
 *  - Background stars bent around the hole (Einstein deflection)
 * The pointer gently pulls the singularity toward it.
 * Output is premultiplied-alpha, so empty space stays transparent and the
 * section blends into the page with no visible edge.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;   // -1..1, smoothed
  uniform vec2  uCenter;  // in height-normalized units
  uniform float uScale;   // shadow radius in height-normalized units
  varying vec2 vUv;

  const float TAU  = 6.2831853;
  const float RISCO = 1.5;   // innermost stable orbit: inner edge of the disk
  const float ROUT  = 5.0;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return v;
  }

  vec3 stars(vec2 p) {
    vec2 g = p * 90.0;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id);
    if (h < 0.982) return vec3(0.0);
    vec2 o = (vec2(hash(id + 1.3), hash(id + 2.7)) - 0.5) * 0.6;
    float s = smoothstep(0.09, 0.0, length(f - o)) * (h - 0.982) * 55.0;
    s *= 0.6 + 0.4 * sin(uTime * 2.0 + h * 80.0);
    return mix(vec3(1.0, 0.88, 0.78), vec3(0.85, 0.9, 1.0), hash(id + 9.1)) * s;
  }

  // Ember → orange → gold → white-hot
  vec3 heat(float x) {
    x = clamp(x, 0.0, 1.0);
    vec3 c0 = vec3(0.05, 0.008, 0.0);
    vec3 c1 = vec3(0.42, 0.06, 0.0);
    vec3 c2 = vec3(1.0, 0.333, 0.0);
    vec3 c3 = vec3(1.0, 0.70, 0.32);
    vec3 c4 = vec3(1.0, 0.96, 0.88);
    if (x < 0.25) return mix(c0, c1, x / 0.25);
    if (x < 0.5)  return mix(c1, c2, (x - 0.25) / 0.25);
    if (x < 0.75) return mix(c2, c3, (x - 0.5) / 0.25);
    return mix(c3, c4, (x - 0.75) / 0.25);
  }

  vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }

  // Anti-aliased line: distance d, pixel width px
  float aline(float d, float px) { return 1.0 - smoothstep(0.0, px * 1.25, d); }

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    vec2 c = uCenter + uMouse * vec2(0.02, 0.015);
    vec2 p = (uv - c) / uScale;                       // event horizon radius == 1
    float t = uTime;

    float r   = length(p);
    float ang = atan(p.y, p.x);
    float a01 = ang / TAU + 0.5;
    float px  = fwidth(r);
    float lr  = log(max(r, 1e-3));
    vec3 orange = vec3(1.0, 0.333, 0.0);
    vec3 col = vec3(0.0);

    // ── lensed starfield + faint nebula haze
    vec2 pl = p * (1.0 - 1.25 / max(r * r, 1.0));
    col += stars(pl * uScale * 0.5 + 0.37) * smoothstep(1.4, 3.2, r);
    float neb = fbm(pl * 0.2 + vec2(t * 0.008, 0.0));
    col += vec3(0.32, 0.07, 0.0) * pow(neb, 3.0) * 0.5 * smoothstep(1.5, 5.0, r);

    // ── warped spacetime grid (subtle)
    float drag = 0.55 / pow(max(r, 1.0), 1.5);
    float ring = aline(abs(fract(lr * 3.4 + t * 0.12) - 0.5), px * 3.4 / max(r, 1e-3));
    float spoke = aline(abs(fract((a01 + drag + t * 0.004) * 48.0) - 0.5) * TAU * r / 48.0, px);
    float gridFade = smoothstep(4.2, 6.0, r) * smoothstep(11.0, 6.5, r);
    col += orange * (ring * 0.45 + spoke * 0.3) * gridFade * 0.3;

    // ── accretion disk (co-rotating, Keplerian ω ∝ r^-1.5)
    float omega = pow(max(r, 1.2), -1.5);
    float rotA = ang - t * 1.35 * omega;
    float sp = rotA + 1.7 * lr;                       // logarithmic spiral shear
    vec2 dir = vec2(cos(sp), sin(sp));
    vec2 q = dir * r;
    vec2 w = vec2(fbm(q * 0.9 + 1.7), fbm(q * 0.9 - 3.1));
    float turb = fbm(q * 1.5 + w * 2.2);
    float fil  = fbm(vec2(r * 12.0, r * 3.0) + dir * 1.6 + w * 1.4);   // fine orbital filaments
    float dust = smoothstep(0.42, 0.66, fbm(q * 2.3 + w * 3.0 + 9.0)); // dark absorbing lanes

    float tt = clamp((r - RISCO) / (ROUT - RISCO), 0.0, 1.0);
    float profile = pow(1.0 - tt, 1.5)
                  * smoothstep(RISCO * 0.97, RISCO * 1.06, r)
                  * smoothstep(ROUT, ROUT * 0.5, r);
    float arms = 0.62 + 0.38 * sin(2.0 * sp + turb * 2.5);
    float dens = (0.3 + 0.95 * turb) * pow(0.45 + 0.75 * fil, 1.6) * arms * (1.0 - 0.6 * dust);
    float temp = (1.0 - tt) * 0.6 + turb * 0.26 - dust * 0.2;
    col += heat(temp) * dens * profile * 1.8;

    // hot rim at the inner edge
    col += vec3(1.0, 0.78, 0.5) * exp(-pow((r - RISCO * 1.03) * 42.0, 2.0)) * (0.55 + 0.45 * fil) * 0.55;

    // ── orbiting sparks (hot clumps riding the flow)
    {
      float N = 140.0;
      float rc = r * 7.0;
      float ac = fract(rotA / TAU) * N;
      vec2 id = vec2(floor(rc), floor(ac));
      float h = hash(id + 3.7);
      if (h > 0.86 && r > RISCO && r < ROUT * 0.9) {
        vec2 o = (vec2(hash(id + 1.1), hash(id + 5.3)) - 0.5) * 0.6;
        float dx = (fract(rc) - 0.5 - o.x) / 7.0;
        float dy = (fract(ac) - 0.5 - o.y) * TAU * r / N;
        float d2 = dx * dx + dy * dy;
        float tw = 0.6 + 0.4 * sin(t * 3.0 + h * 50.0);
        col += vec3(1.0, 0.8, 0.55) * exp(-d2 * 9000.0) * tw * (1.0 - tt) * 1.4;
      }
    }

    // ── matter plunging from the inner edge into the horizon
    float gap = smoothstep(1.0, 1.06, r) * (1.0 - smoothstep(RISCO * 0.92, RISCO * 1.02, r));
    float s2 = ang + 4.5 * lr - t * 2.4;
    float streams = pow(0.5 + 0.5 * sin(3.0 * s2 + fbm(dir * 2.0 + t * 0.2) * 4.0), 5.0);
    col += vec3(1.0, 0.5, 0.15) * streams * gap * 0.3;

    // ── bloom around the disk
    col += vec3(1.0, 0.36, 0.06) * exp(-max(r - RISCO, 0.0) * 1.2) * 0.05 * smoothstep(1.0, 1.5, r);
    col += vec3(1.0, 0.3, 0.0) * exp(-r * 0.32) * 0.07;

    // ── event horizon: pure black core
    float shadow = smoothstep(0.985, 1.015, r);
    col *= shadow;

    // ── photon ring: one crisp line just outside the horizon
    col += vec3(1.0, 0.82, 0.6) * exp(-pow((r - 1.025) * 110.0, 2.0)) * 1.2 * (0.85 + 0.15 * sin(ang * 2.0 + t * 0.8));

    // ── orbiting probes with trails
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float R = 2.3 + fi * 0.95;
      float th = t * 1.7 * pow(R, -1.5) + fi * 2.1;
      vec2 pos = R * vec2(cos(th), sin(th));
      float d = length(p - pos);
      float da = mod(th - ang, TAU);
      float trail = exp(-da * 2.6) * exp(-pow((r - R) * 22.0, 2.0)) * 0.5;
      float dotc = exp(-d * d * 120.0) * 1.4 + exp(-d * d * 8.0) * 0.12;
      col += vec3(1.0, 0.75, 0.5) * (trail + dotc) * shadow;
    }

    // ── tone map
    col = aces(col * 1.0);

    float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.15, 0.0, 1.0);
    alpha = max(alpha, 1.0 - shadow);                 // the hole occludes what is behind it
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function BlackHoleCanvas({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = createRenderer({ antialias: false, alpha: true, premultipliedAlpha: true });
    if (!renderer) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uCenter: { value: new THREE.Vector2(0.2, 0) },
      uScale: { value: 0.075 },
    };
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(geo, mat));

    const target = new THREE.Vector2(0, 0);
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      target.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      uniforms.uRes.value.set(w, h);
      const aspect = w / h;
      if (aspect > 1.15) {
        // Desktop: hole sits right of centre, text on the left
        uniforms.uCenter.value.set(Math.min(0.22 * aspect, 0.42), 0.0);
        uniforms.uScale.value = 0.068;
      } else {
        // Tall / mobile: hole in the upper half, text below; disk fits the width
        uniforms.uCenter.value.set(0.0, 0.2);
        uniforms.uScale.value = Math.min(0.068, (0.46 * aspect) / 6.5);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      if (!reduceMotion) uniforms.uTime.value += dt;
      uniforms.uMouse.value.lerp(target, 0.04);
      renderer.render(scene, camera);
    };
    tick();
    renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={hostRef} className="absolute inset-0" />
      {/* Boundary-free blending into the page above and below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, #0A0A0C 0%, rgba(10,10,12,0) 16%, rgba(10,10,12,0) 84%, #0A0A0C 100%)",
            "linear-gradient(to right, rgba(10,10,12,0.7) 0%, rgba(10,10,12,0) 50%)",
          ].join(","),
        }}
      />
      <div className="pointer-events-none absolute bottom-6 left-5 font-mono text-[10px] tracking-[0.25em] text-qubo-muted sm:left-8 sm:text-[11px]">
        SINGULARITY <span className="text-qubo-orange">/</span> Σ
      </div>
      <div className="pointer-events-none absolute bottom-6 right-5 font-mono text-[11px] tracking-[0.2em] text-qubo-orange sm:right-8 sm:text-xs">
        [ r<sub>s</sub> = 2GM / c² ]
      </div>
    </div>
  );
}