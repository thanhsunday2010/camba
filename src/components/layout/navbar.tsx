import { auth } from "@/auth";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const session = await auth();
  return <NavbarClient initialUser={session?.user} />;
}
