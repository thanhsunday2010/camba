"use client";

import { useSession } from "next-auth/react";
import { MascotToastProvider } from "./mascot-toast-provider";
import { NavigationLoading } from "./navigation-loading";

export function MascotProviderWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  if (session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") {
    return <>{children}</>;
  }

  const userName = session?.user?.name?.split(" ")[0];

  return (
    <MascotToastProvider userName={userName}>
      <NavigationLoading />
      {children}
    </MascotToastProvider>
  );
}
