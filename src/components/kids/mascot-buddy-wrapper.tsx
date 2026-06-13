import { auth } from "@/auth";
import { MascotBuddy } from "./mascot-buddy";

export async function MascotBuddyWrapper() {
  const session = await auth();
  if (session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") {
    return null;
  }
  const userName = session?.user?.name?.split(" ")[0];
  return <MascotBuddy userName={userName} />;
}
