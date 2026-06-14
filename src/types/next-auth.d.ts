import { DefaultSession } from "next-auth";

import type { AdminPermission } from "@/lib/admin/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      targetExam: string;
      adminRoleSlug?: string | null;
      adminRoleName?: string | null;
      adminPermissions?: AdminPermission[];
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    targetExam: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    targetExam: string;
    adminRoleSlug?: string | null;
    adminRoleName?: string | null;
    adminPermissions?: AdminPermission[];
  }
}
