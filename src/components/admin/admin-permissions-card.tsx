import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ADMIN_PERMISSIONS,
  PERMISSION_GROUPS,
  type AdminPermission,
} from "@/lib/admin/permissions";
import type { AdminAccess } from "@/lib/admin/access";
import { Check, X } from "lucide-react";

interface AdminPermissionsCardProps {
  access: AdminAccess;
  showAllCatalog?: boolean;
}

export function AdminPermissionsCard({
  access,
  showAllCatalog = false,
}: AdminPermissionsCardProps) {
  const granted = new Set(access.permissions);

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/80 to-white">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          🔐 Phân quyền của bạn
          <Badge variant="outline">{access.roleName}</Badge>
        </CardTitle>
        <CardDescription>
          {access.canManageRoles
            ? "Bạn có quyền Super Admin — có thể sửa vai trò tại mục Phân quyền."
            : `${access.permissions.length} quyền được cấp cho vai trò này`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PERMISSION_GROUPS.map((group) => {
          const keys = Object.entries(ADMIN_PERMISSIONS)
            .filter(([, meta]) => meta.group === group)
            .map(([key]) => key as AdminPermission);

          if (keys.length === 0) return null;

          const visible = showAllCatalog ? keys : keys.filter((k) => granted.has(k));
          if (visible.length === 0) return null;

          return (
            <div key={group}>
              <p className="mb-2 text-sm font-extrabold text-purple-800">{group}</p>
              <ul className="space-y-1.5">
                {visible.map((key) => {
                  const meta = ADMIN_PERMISSIONS[key];
                  const ok = granted.has(key);
                  return (
                    <li
                      key={key}
                      className="flex items-start gap-2 rounded-lg border border-purple-100 bg-white/80 px-3 py-2 text-sm"
                    >
                      {showAllCatalog ? (
                        ok ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        )
                      ) : (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      <span>
                        <span className="font-semibold">{meta.label}</span>
                        {showAllCatalog && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {meta.description}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
