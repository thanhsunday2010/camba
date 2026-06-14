"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MascotToastProvider } from "./mascot-toast-provider";
import { NavigationLoading } from "./navigation-loading";

export function MascotProviderWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER";
  if (isStaff && pathname.startsWith("/admin")) {
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
