import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminRolesClient } from "@/components/admin/roles-client";
import { requireAdminPage } from "@/lib/admin/access";

export default async function AdminRolesPage() {
  const { access } = await requireAdminPage("roles.manage");

  const roles = await db.adminRole.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { users: true } } },
  });

  if (roles.length === 0) redirect("/admin");

  return <AdminRolesClient roles={roles} access={access} />;
}
