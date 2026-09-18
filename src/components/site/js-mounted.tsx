"use client";

import { useEffect } from "react";

/**
 * Hydration beacon — flips `window.__mutjahMounted` once React effects run.
 * The watchdog timer armed in layout.tsx checks this flag: if hydration
 * never completed (failed/blocked chunks, stale cached HTML), it sets
 * `data-js-failed` on <html> and the CSS fail-open guard forces all
 * animation-gated content visible.
 */
export function JsMounted() {
  useEffect(() => {
    (window as unknown as { __mutjahMounted?: boolean }).__mutjahMounted = true;
  }, []);
  return null;
}
