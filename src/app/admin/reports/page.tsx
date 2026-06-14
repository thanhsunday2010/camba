import { db } from "@/lib/db";
import { AdminBugReportsClient } from "@/components/admin/bug-reports-client";
import { requireAdminPage } from "@/lib/admin/access";

export default async function AdminReportsPage() {
  const { access } = await requireAdminPage("reports.manage");

  const reports = await db.bugReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return <AdminBugReportsClient reports={reports} permissions={access.permissions} />;
}
