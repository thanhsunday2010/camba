import { auth } from "@/auth";
import { getAdminAccess, hasPermission } from "@/lib/admin/access";
import type { AdminPermission } from "@/lib/admin/permissions";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function requireAdminPermissionOrThrow(permission: AdminPermission) {
  const session = await requireAdmin();
  const access = await getAdminAccess(session.user.id);
  if (!access || !hasPermission(access, permission)) throw new Error("Forbidden");
  return { session, access };
}
