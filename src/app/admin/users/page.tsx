import { db } from "@/lib/db";
import { AdminUsersClient } from "@/components/admin/users-client";
import { requireAdminPage, hasPermission } from "@/lib/admin/access";

export default async function AdminUsersPage() {
  const { access } = await requireAdminPage("users.view");

  const [users, adminRoles] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        grade: true,
        targetExam: true,
        createdAt: true,
        adminRoleId: true,
        adminRole: { select: { id: true, name: true, slug: true } },
      },
    }),
    hasPermission(access, "users.manage")
      ? db.adminRole.findMany({
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AdminUsersClient
      users={users}
      adminRoles={adminRoles}
      permissions={access.permissions}
      canManage={hasPermission(access, "users.manage")}
    />
  );
}
