import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YleGalaxyPicker } from "@/components/yle/yle-galaxy-picker";
import { auth } from "@/auth";

export default async function YleGalaxyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <YleGalaxyPicker />;
}
