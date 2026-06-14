"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  deleteBugReportAction,
  updateBugReportStatusAction,
} from "@/lib/actions/bug-report";
import { BugReportStatus } from "@prisma/client";
import { Trash2 } from "lucide-react";

export type BugReportRow = {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  pageUrl: string | null;
  message: string;
  imageData: string | null;
  status: BugReportStatus;
  createdAt: Date;
};

const STATUS_LABEL: Record<BugReportStatus, string> = {
  OPEN: "Mới",
  REVIEWED: "Đã xem",
  RESOLVED: "Đã xử lý",
};

const STATUS_VARIANT: Record<BugReportStatus, "default" | "secondary" | "outline"> = {
  OPEN: "default",
  REVIEWED: "secondary",
  RESOLVED: "outline",
};

export function AdminBugReportsClient({
  reports,
  permissions,
}: {
  reports: BugReportRow[];
  permissions: import("@/lib/admin/permissions").AdminPermission[];
}) {
  const router = useRouter();

  async function setStatus(id: string, status: BugReportStatus) {
    const result = await updateBugReportStatusAction(id, status);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Đã cập nhật trạng thái");
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa báo cáo này?")) return;
    const result = await deleteBugReportAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Đã xóa");
      router.refresh();
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-extrabold kid-gradient-text">Báo lỗi từ người dùng</h1>
      <p className="mb-6 text-muted-foreground">{reports.length} báo cáo</p>
      <AdminNav currentPath="/admin/reports" permissions={permissions} />

      {reports.length === 0 ? (
        <p className="text-muted-foreground">Chưa có báo lỗi nào.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold">
                      {r.userName ?? r.userEmail ?? "Khách / ẩn danh"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString("vi-VN")} · {r.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="whitespace-pre-wrap text-sm">{r.message}</p>
                {r.pageUrl && (
                  <p className="text-xs">
                    <span className="font-semibold text-purple-700">Trang: </span>
                    <a
                      href={r.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sky-600 hover:underline"
                    >
                      {r.pageUrl}
                    </a>
                  </p>
                )}
                {r.imageData && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageData}
                    alt="Ảnh báo lỗi"
                    className="max-h-64 rounded-lg border object-contain"
                  />
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {r.status !== "REVIEWED" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "REVIEWED")}>
                      Đánh dấu đã xem
                    </Button>
                  )}
                  {r.status !== "RESOLVED" && (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, "RESOLVED")}>
                      Đã xử lý
                    </Button>
                  )}
                  {r.status !== "OPEN" && (
                    <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "OPEN")}>
                      Mở lại
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
