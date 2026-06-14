import { PrismaClient } from "@prisma/client";
import { DEFAULT_ADMIN_ROLES } from "../../src/lib/admin/default-roles";

export async function seedAdminRoles(db: PrismaClient) {
  for (const role of DEFAULT_ADMIN_ROLES) {
    await db.adminRole.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        sortOrder: role.sortOrder,
        isSystem: true,
      },
      create: {
        slug: role.slug,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        sortOrder: role.sortOrder,
        isSystem: true,
      },
    });
  }

  const superAdminRole = await db.adminRole.findUnique({
    where: { slug: "super-admin" },
  });

  if (superAdminRole) {
    await db.user.updateMany({
      where: { email: "admin@camba.vn", role: "ADMIN" },
      data: { adminRoleId: superAdminRole.id },
    });
  }

  console.log(`  Admin roles: ${DEFAULT_ADMIN_ROLES.length} vai trò`);
}

if (require.main === module) {
  const db = new PrismaClient();
  seedAdminRoles(db)
    .catch(console.error)
    .finally(() => db.$disconnect());
}
