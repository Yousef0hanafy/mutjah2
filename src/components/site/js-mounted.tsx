"use client";

import { useEffect } from "react";

/**
 * Hydration beacon — flips `window.__mutjahMounted` once React effects run.
 * The watchdog timer armed in layout.tsx checks this flag: if hydration
 * never completed (failed/blocked chunks, stale cached HTML), it sets
 * `data-js-failed` on <html> and the CSS fail-open guard forces all
 * animation-gated content visible.
 *
 * Also verifies IntersectionObserver is actually functional — some privacy
 * extensions stub or break it, which would leave `whileInView` reveals
 * hidden even after a healthy hydration. In that case we flip the same
 * fail-open flag ourselves.
 */
export function JsMounted() {
  useEffect(() => {
    (window as unknown as { __mutjahMounted?: boolean }).__mutjahMounted = true;

    if (typeof IntersectionObserver === "undefined") {
      document.documentElement.setAttribute("data-js-failed", "1");
      return;
    }

    let healthy = false;
    const io = new IntersectionObserver(() => {
      healthy = true;
      io.disconnect();
    });
    io.observe(document.documentElement);

    const timer = window.setTimeout(() => {
      if (!healthy) {
        document.documentElement.setAttribute("data-js-failed", "1");
      }
    }, 1200);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
