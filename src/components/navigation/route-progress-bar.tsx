"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isNavigatingRef = useRef(false);

  // When pathname or searchParams change, navigation completed
  useEffect(() => {
    if (!isNavigatingRef.current) return;
    isNavigatingRef.current = false;

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Asynchronously advance to 100% and fade out
    const completionTimer = setTimeout(() => {
      setProgress(100);
    }, 0);

    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 250);

    return () => {
      clearTimeout(completionTimer);
      clearTimeout(fadeTimer);
    };
  }, [pathname, searchParams]);

  // Global click interceptor for internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore modified clicks (new tab, etc.)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = (e.target as Element | null)?.closest("a");
      if (!target || !target.href) return;

      // Ignore target="_blank", downloads, mailto, tel
      if (target.target === "_blank" || target.hasAttribute("download")) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        return;
      }

      // Check URL origin
      try {
        const url = new URL(target.href, window.location.href);
        if (url.origin !== window.location.origin) return;

        // If it's just a hash change on the same path, ignore
        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
          return;
        }

        // If it's identical path & search, ignore
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }

        // Start progress
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        isNavigatingRef.current = true;
        setIsVisible(true);
        setProgress(28);

        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              return 85;
            }
            return prev + Math.floor(Math.random() * 8 + 4);
          });
        }, 120);

        // Fallback safety timeout (clear after 6s in case navigation is cancelled)
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }, 6000);
      } catch {
        // invalid URL, ignore
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#7D1525] via-[#A52232] to-[#B8975E] transition-all duration-200 ease-out relative"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
          boxShadow: "0 0 10px rgba(184, 151, 94, 0.8), 0 0 5px rgba(165, 34, 50, 0.6)",
        }}
      >
        {/* Glowing Tip */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#FFFDF9] opacity-80" />
      </div>
    </div>
  );
}
