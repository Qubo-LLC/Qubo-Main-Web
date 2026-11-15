import * as THREE from "three";

/**
 * Creates a WebGLRenderer, or returns null if WebGL is unavailable
 * (GPU blocklisted, hardware acceleration off, context limit hit, ...).
 * Callers should bail out of their effect when this returns null.
 */
export function createRenderer(
  params: THREE.WebGLRendererParameters,
): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer(params);
    // Prevent the browser from treating a lost context as fatal.
    renderer.domElement.addEventListener(
      "webglcontextlost",
      (e) => e.preventDefault(),
      false,
    );
    return renderer;
  } catch (err) {
    console.warn("WebGL unavailable, skipping canvas:", err);
    return null;
  }
}
