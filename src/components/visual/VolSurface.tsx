"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Volatility has shape": a procedural implied-volatility surface.
 * x = moneyness (strike vs. spot), z = time to expiry, height = implied vol.
 * The shape is a textbook smile/skew with a term structure, built in code.
 * Three.js is loaded only when the section scrolls into view.
 */
export function VolSurface() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setFailed(true);
        return;
      }
      const css = getComputedStyle(el);
      const color = (n: string) => new THREE.Color(css.getPropertyValue(n).trim());
      const accent = color("--c-accent");
      const paper = color("--c-paper");
      const ink = color("--c-ink");
      const loss = color("--c-loss");

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(5.2, 3.6, 5.4);

      const N = 64;
      const geo = new THREE.PlaneGeometry(4, 4, N, N);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position as import("three").BufferAttribute;
      const colors = new Float32Array(pos.count * 3);
      const vol = (m: number, T: number) => {
        // skew + smile that flatten with maturity, over an upward term structure
        const base = 0.16 + 0.05 * Math.sqrt(T);
        const skew = -0.11 * m / Math.sqrt(T + 0.15);
        const smile = 0.14 * (m * m) / (T + 0.25);
        const ripple = 0.006 * Math.sin(9 * m + 3 * T) * Math.cos(5 * T);
        return base + skew + smile + ripple;
      };
      let vMin = Infinity, vMax = -Infinity;
      const vals: number[] = [];
      for (let i = 0; i < pos.count; i++) {
        const m = pos.getX(i) / 2; // −1..1
        const T = (pos.getZ(i) + 2) / 4 * 1.9 + 0.1; // 0.1..2 years
        const v = vol(m, T);
        vals.push(v);
        vMin = Math.min(vMin, v);
        vMax = Math.max(vMax, v);
      }
      const tmp = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const k = (vals[i] - vMin) / (vMax - vMin);
        pos.setY(i, k * 1.8);
        // paper → teal, with the high-vol wings leaning toward oxblood
        tmp.copy(paper).lerp(accent, Math.min(k * 1.6, 1));
        if (k > 0.7) tmp.lerp(loss, (k - 0.7) / 0.3 * 0.6);
        colors.set([tmp.r, tmp.g, tmp.b], i * 3);
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, flatShading: false }),
      );
      scene.add(mesh);
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.PlaneGeometry(4, 4, 16, 16).rotateX(-Math.PI / 2)),
        new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.12 }),
      );
      // lift the coarse wire grid onto the surface
      const wp = wire.geometry.attributes.position as import("three").BufferAttribute;
      for (let i = 0; i < wp.count; i++) {
        const m = wp.getX(i) / 2;
        const T = (wp.getZ(i) + 2) / 4 * 1.9 + 0.1;
        wp.setY(i, ((vol(m, T) - vMin) / (vMax - vMin)) * 1.8 + 0.004);
      }
      scene.add(wire);

      const base = new THREE.GridHelper(4, 8, ink, ink);
      (base.material as import("three").Material).transparent = true;
      (base.material as import("three").Material).opacity = 0.1;
      scene.add(base);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d3c8, 1.6));
      const sun = new THREE.DirectionalLight(0xffffff, 1.4);
      sun.position.set(3, 6, 2);
      scene.add(sun);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.minPolarAngle = 0.35;
      controls.maxPolarAngle = 1.35;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.5;
      controls.target.set(0, 0.6, 0);

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);
      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) return;
        controls.update();
        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        controls.dispose();
        renderer.dispose();
        geo.dispose();
        renderer.domElement.remove();
      };
    };

    const gate = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        gate.disconnect();
        start().catch(() => setFailed(true));
      }
    }, { rootMargin: "200px" });
    gate.observe(el);

    return () => {
      disposed = true;
      gate.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div
      ref={host}
      role="img"
      aria-label="A 3D implied volatility surface: volatility is lowest near the current price, rises for far-away strikes, and the smile flattens as expiry gets longer. Drag to rotate."
      style={{ width: "100%", aspectRatio: "4 / 3", cursor: "grab", position: "relative" }}
    >
      {failed && <p className="muted small" style={{ padding: "var(--s-5)" }}>Your browser can't show the 3D surface (WebGL is off). The explanation beside it covers the same idea.</p>}
    </div>
  );
}
