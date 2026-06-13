"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  EXAM_LEVELS,
  USER_ROLES,
  formatExamLevel,
} from "@/lib/constants";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/lib/actions/admin";
import { Pencil, Trash2 } from "lucide-react";
import { ExamLevel, Role } from "@prisma/client";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  grade: string | null;
  targetExam: ExamLevel;
  createdAt: Date;
};

export function AdminUsersClient({ users }: { users: UserRow[] }) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await createUserAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Đã tạo tài khoản");
      e.currentTarget.reset();
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("id", editing.id);
    const result = await updateUserAction(fd);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Đã cập nhật");
      setEditing(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Quản lý tài khoản</h1>
      <AdminNav currentPath="/admin/users" />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Sửa tài khoản" : "Tạo tài khoản mới"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              key={editing?.id ?? "create"}
              onSubmit={editing ? handleUpdate : handleCreate}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Họ tên</Label>
                <Input id="name" name="name" required defaultValue={editing?.name ?? ""} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={editing?.email ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Mật khẩu {editing && "(để trống nếu không đổi)"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!editing}
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vai trò</Label>
                  <select
                    name="role"
                    defaultValue={editing?.role ?? "STUDENT"}
                    className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Target exam</Label>
                  <select
                    name="targetExam"
                    defaultValue={editing?.targetExam ?? "KET"}
                    className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {EXAM_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="grade">Lớp (tuỳ chọn)</Label>
                <Input id="grade" name="grade" defaultValue={editing?.grade ?? ""} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {editing ? "Lưu thay đổi" : "Tạo tài khoản"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                    Huỷ
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Danh sách ({users.length})</h2>
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{USER_ROLES.find((r) => r.value === u.role)?.label}</Badge>
                    <Badge variant="secondary">{formatExamLevel(u.targetExam)}</Badge>
                  </div>
                  <p className="mt-2 font-medium">{u.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  {u.grade && (
                    <p className="text-xs text-muted-foreground">Lớp: {u.grade}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(`Xóa ${u.email}?`)) return;
                      const result = await deleteUserAction(u.id);
                      if (result.error) toast.error(result.error);
                      else toast.success("Đã xóa");
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
