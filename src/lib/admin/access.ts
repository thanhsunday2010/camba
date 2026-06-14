import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  ALL_ADMIN_PERMISSIONS,
  type AdminPermission,
  SUPER_ADMIN_SLUG,
  hasPermission,
} from "@/lib/admin/permissions";

export { hasPermission };

export interface AdminAccess {
  roleSlug: string | null;
  roleName: string;
  permissions: AdminPermission[];
  canManageRoles: boolean;
}

const LEGACY_ADMIN_PERMISSIONS = ALL_ADMIN_PERMISSIONS.filter(
  (p) => p !== "roles.manage"
);

export async function getAdminAccess(userId: string): Promise<AdminAccess | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { adminRole: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  if (user.adminRole) {
    const permissions = user.adminRole.permissions.filter((p): p is AdminPermission =>
      ALL_ADMIN_PERMISSIONS.includes(p as AdminPermission)
    );
    const isSuperAdmin = user.adminRole.slug === SUPER_ADMIN_SLUG;
    const effectivePermissions = isSuperAdmin ? [...ALL_ADMIN_PERMISSIONS] : permissions;
    return {
      roleSlug: user.adminRole.slug,
      roleName: user.adminRole.name,
      permissions: effectivePermissions,
      canManageRoles: isSuperAdmin || permissions.includes("roles.manage"),
    };
  }

  return {
    roleSlug: null,
    roleName: "Quản trị viên (mặc định)",
    permissions: [...LEGACY_ADMIN_PERMISSIONS],
    canManageRoles: false,
  };
}

export async function loadAdminAccessForToken(userId: string) {
  const access = await getAdminAccess(userId);
  if (!access) {
    return {
      adminRoleSlug: null as string | null,
      adminRoleName: null as string | null,
      adminPermissions: [] as AdminPermission[],
    };
  }
  return {
    adminRoleSlug: access.roleSlug,
    adminRoleName: access.roleName,
    adminPermissions: access.permissions,
  };
}

export async function requireAdminPermission(permission: AdminPermission) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" as const, session: null, access: null };
  }

  const access = await getAdminAccess(session.user.id);
  if (!access || !hasPermission(access, permission)) {
    return { error: "Không có quyền thực hiện thao tác này" as const, session: null, access: null };
  }

  return { session, access, error: null };
}

/** For admin pages — redirects if missing permission */
export async function requireAdminPage(permission: AdminPermission) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const access = await getAdminAccess(session.user.id);
  if (!access || !hasPermission(access, permission)) redirect("/admin?denied=1");

  return { session, access };
}

export function isSuperAdminRole(slug: string | null | undefined): boolean {
  return slug === SUPER_ADMIN_SLUG;
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return "Không có quyền" as const;
  }
  const access = await getAdminAccess(session.user.id);
  if (!access || !isSuperAdminRole(access.roleSlug)) {
    return "Chỉ Super Admin mới được thực hiện thao tác này" as const;
  }
  return null;
}
