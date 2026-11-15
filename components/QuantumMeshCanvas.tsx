"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createRenderer } from "./webgl";

/**
 * Interactive Quantum Topology Mesh.
 * An undulating mathematical surface (grid lines + vertex particles) with
 * floating neon-orange vector nodes. Pointer movement raises a local bump
 * on the surface and emits ripple waves that propagate outward.
 * All displacement happens in GLSL so the CPU only updates a few uniforms.
 */

// The surface is far larger than the camera frustum, and depth fog fades it
// to zero well before its edges, so no boundary of the plane is ever visible.
const GRID_W = 72; // world units
const GRID_D = 72;
const SEG = 180; // segments per side
const MAX_RIPPLES = 8;
const NODE_COUNT = 150;
const NODE_SPREAD = 44; // nodes stay in the visible central region

const SURFACE_GLSL = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uHover;
  uniform vec4  uRipples[${MAX_RIPPLES}]; // xy = origin, z = start time, w = strength

  float surface(vec2 p) {
    float t = uTime;
    float h = sin(p.x * 0.34 + t * 0.55) * 0.55
            + cos(p.y * 0.41 + t * 0.42) * 0.45
            + sin((p.x + p.y) * 0.21 + t * 0.75) * 0.38
            + sin(p.x * 0.92 - t * 0.9) * cos(p.y * 0.81 + t * 0.6) * 0.22;

    // Pointer gravity well (rises toward the cursor)
    float d = distance(p, uMouse);
    h += exp(-d * d * 0.09) * uHover * 1.35;

    // Propagating ripples
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = t - r.z;
      if (age > 0.0 && age < 4.5 && r.w > 0.0) {
        float rd = distance(p, r.xy);
        float front = exp(-abs(rd - age * 3.0) * 0.7);
        h += sin(rd * 2.3 - age * 6.5) * exp(-age * 0.85) * front * r.w;
      }
    }
    return h;
  }
`;

const meshVertex = /* glsl */ `
  ${SURFACE_GLSL}
  uniform float uPointSize;
  varying float vHeight;
  varying float vFog;
  varying float vNear;

  void main() {
    vec3 pos = position;
    pos.y = surface(pos.xz);
    vHeight = pos.y;
    vNear = exp(-pow(distance(pos.xz, uMouse), 2.0) * 0.06) * uHover;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vFog = smoothstep(40.0, 14.0, -mv.z);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPointSize * (14.0 / -mv.z);
  }
`;

const lineFragment = /* glsl */ `
  varying float vHeight;
  varying float vFog;
  varying float vNear;
  void main() {
    vec3 base = vec3(0.32, 0.32, 0.38);
    vec3 orange = vec3(1.0, 0.333, 0.0);
    float heat = clamp(vHeight * 0.45 + 0.15, 0.0, 1.0) * 0.55 + vNear * 0.9;
    vec3 col = mix(base, orange, clamp(heat, 0.0, 1.0));
    gl_FragColor = vec4(col, (0.16 + heat * 0.4) * vFog);
  }
`;

const pointFragment = /* glsl */ `
  varying float vHeight;
  varying float vFog;
  varying float vNear;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    vec3 orange = vec3(1.0, 0.333, 0.0);
    vec3 white = vec3(0.85, 0.85, 0.9);
    float heat = clamp(vHeight * 0.5 + vNear, 0.0, 1.0);
    vec3 col = mix(white * 0.6, orange, heat);
    gl_FragColor = vec4(col, core * (0.25 + heat * 0.6) * vFog);
  }
`;

const nodeVertex = /* glsl */ `
  ${SURFACE_GLSL}
  attribute float aSeed;
  attribute float aEnd;   // 0 = on surface, 1 = floating tip (used by stems)
  uniform float uIsStem;
  varying float vFog;
  varying float vPulse;
  varying float vEnd;

  void main() {
    vec3 pos = position;
    float s = surface(pos.xz);
    float lift = 1.1 + sin(uTime * 0.8 + aSeed * 6.283) * 0.45 + aSeed * 0.9;
    float tip = s + lift;
    pos.y = uIsStem > 0.5 ? mix(s, tip, aEnd) : tip;
    vEnd = aEnd;
    vPulse = 0.55 + 0.45 * sin(uTime * 2.2 + aSeed * 40.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vFog = smoothstep(40.0, 12.0, -mv.z);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (9.0 + vPulse * 7.0) * (14.0 / -mv.z);
  }
`;

const nodeFragment = /* glsl */ `
  varying float vFog;
  varying float vPulse;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.18, 0.0, d);
    float halo = smoothstep(0.5, 0.05, d) * 0.55;
    vec3 col = mix(vec3(1.0, 0.333, 0.0), vec3(1.0, 0.85, 0.7), core * 0.6);
    gl_FragColor = vec4(col, (core + halo) * vPulse * vFog);
  }
`;

const stemFragment = /* glsl */ `
  varying float vFog;
  varying float vEnd;
  void main() {
    gl_FragColor = vec4(1.0, 0.333, 0.0, vEnd * 0.45 * vFog);
  }
`;

function buildGridLines(): THREE.BufferGeometry {
  const pts: number[] = [];
  const step = 2; // every other row → cleaner editorial grid
  const hw = GRID_W / 2;
  const hd = GRID_D / 2;
  const fine = 3; // sub-segments per cell so lines bend with the surface

  for (let j = 0; j <= SEG; j += step) {
    const z = -hd + (j / SEG) * GRID_D;
    for (let i = 0; i < SEG * fine; i++) {
      const x0 = -hw + (i / (SEG * fine)) * GRID_W;
      const x1 = -hw + ((i + 1) / (SEG * fine)) * GRID_W;
      pts.push(x0, 0, z, x1, 0, z);
    }
  }
  for (let i = 0; i <= SEG; i += step) {
    const x = -hw + (i / SEG) * GRID_W;
    for (let j = 0; j < SEG * fine; j++) {
      const z0 = -hd + (j / (SEG * fine)) * GRID_D;
      const z1 = -hd + ((j + 1) / (SEG * fine)) * GRID_D;
      pts.push(x, 0, z0, x, 0, z1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

export default function QuantumMeshCanvas({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = createRenderer({ antialias: true, alpha: true });
    if (!renderer) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // fully transparent: no gray box
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    // Steeper downward tilt: the surface fills the whole viewport, top to bottom
    camera.position.set(0, 11, 15);
    camera.lookAt(0, 0, -5);

    const group = new THREE.Group();
    scene.add(group);

    // ── Shared uniforms ───────────────────────────────────────
    const ripples = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0));
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uRipples: { value: ripples },
      uPointSize: { value: 2.2 },
      uIsStem: { value: 0 },
    };

    // ── Surface: grid lines ───────────────────────────────────
    const lineGeo = buildGridLines();
    const lineMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: meshVertex,
      fragmentShader: lineFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    // ── Surface: vertex particles ─────────────────────────────
    const planeGeo = new THREE.PlaneGeometry(GRID_W, GRID_D, SEG, SEG);
    planeGeo.rotateX(-Math.PI / 2);
    const pointMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: meshVertex,
      fragmentShader: pointFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.Points(planeGeo, pointMat));

    // ── Floating vector nodes + stems ─────────────────────────
    const nodePos = new Float32Array(NODE_COUNT * 3);
    const nodeSeed = new Float32Array(NODE_COUNT);
    const nodeEnd = new Float32Array(NODE_COUNT).fill(1);
    const stemPos = new Float32Array(NODE_COUNT * 6);
    const stemSeed = new Float32Array(NODE_COUNT * 2);
    const stemEnd = new Float32Array(NODE_COUNT * 2);

    for (let i = 0; i < NODE_COUNT; i++) {
      const x = (Math.random() - 0.5) * NODE_SPREAD;
      const z = (Math.random() - 0.5) * NODE_SPREAD - 6;
      const s = Math.random();
      nodePos.set([x, 0, z], i * 3);
      nodeSeed[i] = s;
      stemPos.set([x, 0, z, x, 0, z], i * 6);
      stemSeed[i * 2] = s;
      stemSeed[i * 2 + 1] = s;
      stemEnd[i * 2] = 0;
      stemEnd[i * 2 + 1] = 1;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute("aSeed", new THREE.BufferAttribute(nodeSeed, 1));
    nodeGeo.setAttribute("aEnd", new THREE.BufferAttribute(nodeEnd, 1));
    const nodeMat = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, uIsStem: { value: 0 } },
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.Points(nodeGeo, nodeMat));

    const stemGeo = new THREE.BufferGeometry();
    stemGeo.setAttribute("position", new THREE.BufferAttribute(stemPos, 3));
    stemGeo.setAttribute("aSeed", new THREE.BufferAttribute(stemSeed, 1));
    stemGeo.setAttribute("aEnd", new THREE.BufferAttribute(stemEnd, 1));
    const stemMat = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, uIsStem: { value: 1 } },
      vertexShader: nodeVertex,
      fragmentShader: stemFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.LineSegments(stemGeo, stemMat));

    // ── Pointer → surface mapping ─────────────────────────────
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const mouseTarget = new THREE.Vector2(0, 0);
    const lastRipple = new THREE.Vector2(999, 999);
    let hoverTarget = 0;
    let rippleIdx = 0;

    const emitRipple = (x: number, z: number, strength: number) => {
      ripples[rippleIdx].set(x, z, uniforms.uTime.value, strength);
      rippleIdx = (rippleIdx + 1) % MAX_RIPPLES;
    };

    const toLocal = (clientX: number, clientY: number): boolean => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return false;
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(groundPlane, hit)) return false;
      group.worldToLocal(hit);
      return Math.abs(hit.x) < GRID_W / 2 && Math.abs(hit.z) < GRID_D / 2;
    };

    const onMove = (e: PointerEvent) => {
      if (!toLocal(e.clientX, e.clientY)) {
        hoverTarget = 0;
        return;
      }
      hoverTarget = 1;
      mouseTarget.set(hit.x, hit.z);
      if (lastRipple.distanceTo(mouseTarget) > 2.4) {
        emitRipple(hit.x, hit.z, 0.35);
        lastRipple.copy(mouseTarget);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (toLocal(e.clientX, e.clientY)) emitRipple(hit.x, hit.z, 0.9);
    };
    const onLeave = () => {
      hoverTarget = 0;
    };

    // Listen on window: hero text sits on top of the canvas, and the mesh
    // should still react when the cursor passes over it.
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // ── Sizing ────────────────────────────────────────────────
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // Tall / mobile viewports: lift and pull back so the surface still fills the frame
      camera.position.set(0, w / h < 1 ? 15 : 11, w / h < 1 ? 19 : 15);
      camera.lookAt(0, 0, -5);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // ── Loop (paused while offscreen) ─────────────────────────
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += reduceMotion ? 0 : dt;
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.06;
      uniforms.uMouse.value.lerp(mouseTarget, 0.12);
      group.rotation.y += reduceMotion ? 0 : dt * 0.025;
      renderer.render(scene, camera);
    };
    tick();

    // Initial ripple so the surface "boots up"
    emitRipple(0, 0, 0.8);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      [lineGeo, planeGeo, nodeGeo, stemGeo].forEach((g) => g.dispose());
      [lineMat, pointMat, nodeMat, stemMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={hostRef} className="absolute inset-0" />

      {/* Soft, boundary-free blending: no hard edges anywhere.
          - top: dissolves behind the transparent header
          - bottom: melts into the page so there is no visible seam
          - left: a gentle wash keeps the headline legible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, #0A0A0C 0%, rgba(10,10,12,0) 18%, rgba(10,10,12,0) 72%, #0A0A0C 100%)",
            "linear-gradient(to right, rgba(10,10,12,0.78) 0%, rgba(10,10,12,0.35) 38%, rgba(10,10,12,0) 62%)",
          ].join(","),
        }}
      />

      {/* Telemetry overlays */}
      <div className="pointer-events-none absolute bottom-6 left-5 font-mono text-[10px] tracking-[0.25em] text-qubo-muted sm:left-8 sm:text-[11px]">
        QUANTUM TOPOLOGY <span className="text-qubo-orange">/</span> Q
      </div>
      <div className="pointer-events-none absolute bottom-6 right-5 font-mono text-[11px] tracking-[0.2em] text-qubo-orange sm:right-8 sm:text-xs">
        [ ∂ψ / ∂t ]
      </div>
    </div>
  );
}
