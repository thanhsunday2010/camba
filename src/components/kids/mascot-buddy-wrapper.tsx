import { auth } from "@/auth";
import { MascotToastProvider } from "./mascot-toast-provider";

export async function MascotProviderWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") {
    return <>{children}</>;
  }
  const userName = session?.user?.name?.split(" ")[0];
  return <MascotToastProvider userName={userName}>{children}</MascotToastProvider>;
}
