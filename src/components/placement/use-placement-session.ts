"use client";

import { useSession } from "next-auth/react";

/** Tránh flash form khách khi session đang hydrate trên desktop */
export function usePlacementSession(initialIsLoggedIn = false) {
  const { data: session, status } = useSession();

  const isLoggedIn =
    status === "authenticated"
      ? !!session?.user
      : status === "unauthenticated"
        ? false
        : initialIsLoggedIn;

  const sessionPending = status === "loading";

  return { isLoggedIn, sessionPending, session };
}
