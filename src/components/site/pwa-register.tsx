"use client";

import { useEffect } from "react";

/**
 * PwaRegister handles client-side service worker registration
 * and PWA install lifecycle.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSw = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Listen for new versions
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New update available, activate silently
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });
      } catch (err) {
        console.debug("SW registration info:", err);
      }
    };

    if (document.readyState === "complete") {
      registerSw();
    } else {
      window.addEventListener("load", registerSw);
      return () => window.removeEventListener("load", registerSw);
    }
  }, []);

  return null;
}
