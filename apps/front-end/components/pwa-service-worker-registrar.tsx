"use client";

import { useEffect } from "react";

const SERVICE_WORKER_URL = "/sw.js";

export function PwaServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (!window.isSecureContext) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(SERVICE_WORKER_URL, { scope: "/" })
        .catch((error) => {
          console.error("[pwa] service worker registration failed", error);
        });
    });
  }, []);

  return null;
}
