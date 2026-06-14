"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { updateAdminRoleAction } from "@/lib/actions/admin-roles";
import {
  ADMIN_PERMISSIONS,
  PERMISSION_GROUPS,
  type AdminPermission,
  SUPER_ADMIN_SLUG,
} from "@/lib/admin/permissions";
import type { AdminAccess } from "@/lib/admin/access";
import { cn } from "@/lib/utils";

interface RoleRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  _count: { users: number };
}

interface AdminRolesClientProps {
  roles: RoleRow[];
  access: AdminAccess;
}

export function AdminRolesClient({ roles, access }: AdminRolesClientProps) {
  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const formData = new FormData(e.currentTarget);
    formData.set("id", selected.id);

    startTransition(async () => {
      const res = await updateAdminRoleAction(formData);
      if (res.error) toast.error(res.error);
      else toast.success("Đã cập nhật vai trò");
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNav currentPath="/admin/roles" permissions={access.permissions} />

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold kid-gradient-text">Phân quyền Admin</h1>
        <p className="text-muted-foreground">
          Chỉ Super Admin có thể chỉnh sửa quyền của từng cấp admin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-2 border-purple-100 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Vai trò hệ thống</CardTitle>
            <CardDescription>{roles.length} cấp admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedId(role.id)}
                className={cn(
                  "w-full rounded-xl border-2 p-3 text-left transition-colors",
                  selected?.id === role.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-purple-100 hover:border-purple-200"
                )}
              >
                <p className="font-bold">{role.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {role.description}
                </p>
                <Badge variant="outline" className="mt-2">
                  {role._count.users} người · {role.permissions.length} quyền
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {selected && (
          <Card className="border-2 border-purple-100 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selected.name}
                {selected.slug === SUPER_ADMIN_SLUG && (
                  <Badge className="bg-violet-600">Super Admin</Badge>
                )}
              </CardTitle>
              <CardDescription>{selected.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Tên hiển thị</Label>
                    <Input id="name" name="name" defaultValue={selected.name} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={selected.description ?? ""}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-bold text-purple-800">Quyền được cấp</p>
                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map((group) => {
                      const keys = Object.entries(ADMIN_PERMISSIONS)
                        .filter(([, m]) => m.group === group)
                        .map(([k]) => k as AdminPermission);
                      if (keys.length === 0) return null;

                      return (
                        <div key={group} className="rounded-xl border bg-slate-50/80 p-3">
                          <p className="mb-2 text-sm font-extrabold text-purple-700">{group}</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {keys.map((perm) => {
                              const meta = ADMIN_PERMISSIONS[perm];
                              const locked =
                                selected.slug === SUPER_ADMIN_SLUG &&
                                perm === "roles.manage";
                              return (
                                <label
                                  key={perm}
                                  className={cn(
                                    "flex cursor-pointer items-start gap-2 rounded-lg border bg-white p-2 text-sm",
                                    locked && "opacity-80"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    name="permissions"
                                    value={perm}
                                    defaultChecked={selected.permissions.includes(perm)}
                                    disabled={locked}
                                    className="mt-1"
                                  />
                                  <span>
                                    <span className="font-semibold">{meta.label}</span>
                                    <span className="block text-xs text-muted-foreground">
                                      {meta.description}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button type="submit" disabled={pending} className="rounded-full">
                  {pending ? "Đang lưu..." : "Lưu phân quyền"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
