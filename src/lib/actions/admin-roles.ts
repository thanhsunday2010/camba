"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  ALL_ADMIN_PERMISSIONS,
  type AdminPermission,
  SUPER_ADMIN_SLUG,
} from "@/lib/admin/permissions";
import { requireAdminPermission } from "@/lib/admin/access";

const updateRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()),
});

export async function listAdminRolesAction() {
  const check = await requireAdminPermission("roles.manage");
  if (check.error) return { error: check.error };

  const roles = await db.adminRole.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return { roles };
}

export async function updateAdminRoleAction(formData: FormData) {
  const check = await requireAdminPermission("roles.manage");
  if (check.error) return { error: check.error };

  const permissionsRaw = formData.getAll("permissions").map(String);
  const parsed = updateRoleSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    permissions: permissionsRaw,
  });

  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const role = await db.adminRole.findUnique({ where: { id: parsed.data.id } });
  if (!role) return { error: "Không tìm thấy vai trò" };

  const permissions = parsed.data.permissions.filter((p): p is AdminPermission =>
    ALL_ADMIN_PERMISSIONS.includes(p as AdminPermission)
  );

  if (permissions.length === 0) {
    return { error: "Vai trò cần ít nhất một quyền" };
  }

  if (role.slug === SUPER_ADMIN_SLUG && !permissions.includes("roles.manage")) {
    return { error: "Super Admin phải giữ quyền quản lý phân quyền" };
  }

  await db.adminRole.update({
    where: { id: role.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      permissions,
    },
  });

  revalidatePath("/admin/roles");
  revalidatePath("/admin");
  return { success: true };
}

export async function assignAdminRoleAction(userId: string, adminRoleId: string | null) {
  const check = await requireAdminPermission("users.manage");
  if (check.error) return { error: check.error };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Không tìm thấy người dùng" };
  if (user.role !== "ADMIN") return { error: "Chỉ gán vai trò admin cho tài khoản ADMIN" };

  if (adminRoleId) {
    const role = await db.adminRole.findUnique({ where: { id: adminRoleId } });
    if (!role) return { error: "Vai trò không hợp lệ" };
  }

  await db.user.update({
    where: { id: userId },
    data: { adminRoleId },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getAdminRolesForSelectAction() {
  const check = await requireAdminPermission("users.manage");
  if (check.error) return { error: check.error, roles: [] };

  const roles = await db.adminRole.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return { roles };
}
