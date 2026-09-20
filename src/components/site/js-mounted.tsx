"use client";

import { useEffect } from "react";

/**
 * Hydration beacon + self-healing visibility guard.
 *
 * 1. Flips `window.__mutjahMounted` once React effects run — the watchdog
 *    timer armed in layout.tsx checks it: if hydration never completed
 *    (failed/blocked chunks, stale cached HTML), it sets `data-js-failed`
 *    on <html> and the CSS fail-open guard forces all animation-gated
 *    content visible.
 *
 * 2. Probes IntersectionObserver health — privacy extensions sometimes
 *    stub or break it, which would leave scroll-reveals hidden. A dead IO
 *    flips the same fail-open flag.
 *
 * 3. Runs a self-healing sweep — if ANY reveal-armed element is found
 *    sitting hidden inside the viewport across two consecutive ticks
 *    (a crashed/paused animation system), the fail-open flag flips and
 *    everything becomes visible. Stuck-hidden content is structurally
 *    impossible.
 */
export function JsMounted() {
  useEffect(() => {
    (window as unknown as { __mutjahMounted?: boolean }).__mutjahMounted = true;

    const root = document.documentElement;
    const failOpen = () => root.setAttribute("data-js-failed", "1");

    // — 2. IntersectionObserver health probe —
    if (typeof IntersectionObserver === "undefined") {
      failOpen();
      return;
    }
    let ioHealthy = false;
    const probe = new IntersectionObserver(() => {
      ioHealthy = true;
      probe.disconnect();
    });
    probe.observe(root);
    const probeTimer = window.setTimeout(() => {
      if (!ioHealthy) failOpen();
    }, 5000);

    // — 3. Self-healing sweep (two consecutive ticks = genuinely stuck) —
    const seen = new WeakSet<Element>();
    const insideViewport = (el: Element) => {
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        r.top < window.innerHeight - 60 &&
        r.bottom > 60 &&
        r.left < window.innerWidth - 60 &&
        r.right > 60
      );
    };
    const sweep = window.setInterval(() => {
      if (root.getAttribute("data-js-failed") === "1") return;
      const stuck = document.querySelectorAll('[data-reveal="hidden"]');
      for (const el of Array.from(stuck)) {
        if (insideViewport(el)) {
          if (seen.has(el)) {
            failOpen();
            return;
          }
          seen.add(el);
        } else {
          seen.delete(el);
        }
      }
    }, 1500);

    return () => {
      probe.disconnect();
      window.clearTimeout(probeTimer);
      window.clearInterval(sweep);
    };
  }, []);

  return null;
}
