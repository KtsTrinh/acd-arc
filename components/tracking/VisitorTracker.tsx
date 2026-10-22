"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const HEARTBEAT_MS = 30000;

type TrackPayload = {
  type: "pageview" | "duration" | "heartbeat";
  path: string;
  durationSec?: number;
  referrer?: string;
};

export default function VisitorTracker() {
  const pathname = usePathname();
  const enteredAtRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(pathname);
  const isFirstRef = useRef(true);

  useEffect(() => {
    const send = (payload: TrackPayload, useBeacon = false) => {
      const body = JSON.stringify(payload);

      if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "application/json" })
        );
        return;
      }

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => undefined);
    };

    const durationSec = Math.round(
      (Date.now() - enteredAtRef.current) / 1000
    );
    const isFirst = isFirstRef.current;

    enteredAtRef.current = Date.now();
    currentPathRef.current = pathname;
    isFirstRef.current = false;

    send({
      type: "pageview",
      path: pathname,
      durationSec: isFirst ? 0 : durationSec,
      referrer: isFirst && typeof document !== "undefined" ? document.referrer : undefined,
    });
  }, [pathname]);

  // Giữ nhịp để CMS biết khách vẫn đang ở trên website
  useEffect(() => {
    const timer = setInterval(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "heartbeat", path: currentPathRef.current }),
        keepalive: true,
      }).catch(() => undefined);
    }, HEARTBEAT_MS);

    return () => clearInterval(timer);
  }, []);

  // Ghi lại thời gian ở lại khi khách đóng tab / chuyển tab
  useEffect(() => {
    const flush = () => {
      const durationSec = Math.round(
        (Date.now() - enteredAtRef.current) / 1000
      );

      if (durationSec < 1) return;

      const body = JSON.stringify({
        type: "duration",
        path: currentPathRef.current,
        durationSec,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "application/json" })
        );
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => undefined);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", flush);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", flush);
    };
  }, []);

  return null;
}
