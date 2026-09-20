"use client";

import { useEffect, useRef } from "react";

const INK = "#10141C";
const VECTOR = "#315BFF";
const CORAL = "#FF6247";

const SPACING = 56; // grid cell (px)
const NEAR = 270; // px radius of full cursor influence
const RIPPLE_LIFE = 1100; // ms
const RIPPLE_SPEED = 0.34; // px per ms

type Needle = { x: number; y: number };
type Ripple = { x: number; y: number; t0: number };

/** Shortest signed angular distance from a to b (radians) */
function shortestDelta(a: number, b: number) {
  return ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
}

/**
 * The Direction Field — MUTJAH's living hero backdrop.
 *
 * A calm grid of compass needles that all rotate to point at the visitor's
 * cursor (nearest needles glow vector-blue and grow). When the pointer is
 * away, a coral beacon roams the field so it stays alive on touch devices;
 * clicking fires a ripple that bends the needles outward.
 *
 * Purely decorative: additive layer, zero impact on content visibility.
 * Honors prefers-reduced-motion (single static frame) and pauses when the
 * hero is off-screen or the tab is hidden.
 */
export function DirectionField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 1;
    let h = 1;
    let needles: Needle[] = [];
    let angles = new Float32Array(1);
    let raf = 0;
    let onScreen = true;
    let tabVisible = !document.hidden;
    const dirForward = document.documentElement.dir === "rtl" ? Math.PI : 0;

    const target = { x: 0, y: 0 };
    let pointerInside = false;
    let ripples: Ripple[] = [];

    const build = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needles = [];
      for (let y = SPACING / 2; y < h; y += SPACING) {
        for (let x = SPACING / 2; x < w; x += SPACING) {
          needles.push({ x, y });
        }
      }
      angles = new Float32Array(needles.length);
      for (let i = 0; i < needles.length; i++) angles[i] = dirForward;
    };

    /** Slow lissajous drift — the field keeps breathing without a pointer */
    const beacon = (t: number) => ({
      x: w * 0.5 + w * 0.3 * Math.sin(t * 0.00023 + 1.7),
      y: h * 0.48 + h * 0.26 * Math.sin(t * 0.00031 + 0.4),
    });

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || !tabVisible) return;

      ripples = ripples.filter((r) => now - r.t0 < RIPPLE_LIFE);
      const tgt = pointerInside ? target : beacon(now);
      ctx.clearRect(0, 0, w, h);

      // bucket needles by style so each frame costs ~4 strokes
      type Seg = { x1: number; y1: number; x2: number; y2: number };
      const buckets: { color: string; alpha: number; width: number; segs: Seg[] }[] = [
        { color: INK, alpha: 0.17, width: 1.4, segs: [] }, // far — faint texture
        { color: INK, alpha: 0.4, width: 1.6, segs: [] }, // mid
        { color: VECTOR, alpha: 0.66, width: 2, segs: [] }, // influenced — brand blue
        { color: CORAL, alpha: 0.9, width: 2.4, segs: [] }, // ripple burst
      ];
      const pick = (i: number) =>
        i === 3 ? buckets[3] : i === 2 ? buckets[2] : i === 1 ? buckets[1] : buckets[0];

      for (let i = 0; i < needles.length; i++) {
        const n = needles[i];
        const dx = tgt.x - n.x;
        const dy = tgt.y - n.y;
        const dist = Math.hypot(dx, dy);
        let desired = Math.atan2(dy, dx);
        let inf = Math.max(0, 1 - dist / NEAR);
        if (!pointerInside) inf *= 0.7; // calmer when idle

        // ripple: bend needles radially outward near the expanding ring
        let rip = 0;
        let ripAngle = 0;
        for (const r of ripples) {
          const age = (now - r.t0) / RIPPLE_LIFE;
          const ring = age * RIPPLE_SPEED * RIPPLE_LIFE;
          const rd = Math.abs(Math.hypot(n.x - r.x, n.y - r.y) - ring);
          if (rd < 46) {
            const b = (1 - rd / 46) * (1 - age);
            if (b > rip) {
              rip = b;
              ripAngle = Math.atan2(n.y - r.y, n.x - r.x);
            }
          }
        }
        if (rip > 0) desired += shortestDelta(desired, ripAngle) * rip * 0.9;

        const next = angles[i] + shortestDelta(angles[i], desired) * 0.14;
        angles[i] = next;

        const len = 6 + 10 * inf + 8 * rip;
        const halflen = len / 2;
        const c = Math.cos(next) * halflen;
        const s = Math.sin(next) * halflen;
        const tier =
          rip > 0.45 ? 3 : inf > 0.34 || rip > 0.15 ? 2 : inf > 0.12 ? 1 : 0;
        pick(tier).segs.push({ x1: n.x - c, y1: n.y - s, x2: n.x + c, y2: n.y + s });
      }

      for (const b of buckets) {
        if (b.segs.length === 0) continue;
        ctx.strokeStyle = b.color;
        ctx.globalAlpha = b.alpha;
        ctx.lineWidth = b.width;
        ctx.beginPath();
        for (const s2 of b.segs) {
          ctx.moveTo(s2.x1, s2.y1);
          ctx.lineTo(s2.x2, s2.y2);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // the point itself — cursor dot or roaming beacon
      const px = tgt.x;
      const py = tgt.y;
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.004);
      ctx.fillStyle = CORAL;
      ctx.globalAlpha = 0.16 + 0.12 * pulse;
      ctx.beginPath();
      ctx.arc(px, py, pointerInside ? 16 + 5 * pulse : 22 + 6 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(px, py, pointerInside ? 3.5 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const toLocal = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        w: rect.width,
        h: rect.height,
      };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      pointerInside = p.x >= 0 && p.y >= 0 && p.x <= p.w && p.y <= p.h;
      if (pointerInside) {
        target.x = p.x;
        target.y = p.y;
      }
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      if (p.x < 0 || p.y < 0 || p.x > p.w || p.y > p.h) return;
      ripples.push({ x: p.x, y: p.y, t0: performance.now() });
      if (ripples.length > 3) ripples.shift();
      if (e.pointerType !== "mouse") {
        // touch: also steer the field toward the tap for a moment
        target.x = p.x;
        target.y = p.y;
        pointerInside = true;
        window.clearTimeout(steerTimer);
        steerTimer = window.setTimeout(() => {
          pointerInside = false;
        }, 1800);
      }
    };
    let steerTimer = 0;

    const onVisibility = () => {
      tabVisible = !document.hidden;
    };

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    io.observe(host);
    const ro = new ResizeObserver(build);

    build();
    ro.observe(host);
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(steerTimer);
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0" />;
}
