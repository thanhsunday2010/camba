"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMascotToast } from "./mascot-toast-provider";
import { mascotPageLoadingMessage } from "@/lib/kids/mascot-messages";

const LOADING_DELAY_MS = 2000;

function isInternalNavLink(anchor: HTMLAnchorElement, pathname: string): boolean {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (href.startsWith("http://") || href.startsWith("https://")) return false;

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === pathname && url.search === window.location.search) return false;
    return true;
  } catch {
    return false;
  }
}

/** Show mascot if client navigation takes longer than 2s. */
export function NavigationLoading() {
  const pathname = usePathname();
  const { showMascot, hideMascot } = useMascotToast();
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingShownRef = useRef(false);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element).closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavLink(anchor, pathname)) return;

      pendingRef.current = true;
      loadingShownRef.current = false;
      clearTimer();

      timerRef.current = setTimeout(() => {
        if (pendingRef.current) {
          loadingShownRef.current = true;
          showMascot(mascotPageLoadingMessage());
        }
      }, LOADING_DELAY_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimer();
    };
  }, [pathname, showMascot]);

  useEffect(() => {
    pendingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (loadingShownRef.current) {
      hideMascot();
      loadingShownRef.current = false;
    }
  }, [pathname, hideMascot]);

  return null;
}
