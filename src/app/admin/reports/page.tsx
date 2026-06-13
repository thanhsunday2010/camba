import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AdminBugReportsClient } from "@/components/admin/bug-reports-client";

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const reports = await db.bugReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return <AdminBugReportsClient reports={reports} />;
}
