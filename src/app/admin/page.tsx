import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  Bug,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Target,
  Users,
} from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [
    userCount,
    questionCount,
    paperCount,
    placementCount,
    openReports,
    recentReports,
  ] = await Promise.all([
    db.user.count(),
    db.question.count(),
    db.examPaper.count(),
    db.attempt.count({ where: { paper: { paperKind: "PLACEMENT" }, status: { not: "IN_PROGRESS" } } }),
    db.bugReport.count({ where: { status: "OPEN" } }),
    db.bugReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        message: true,
        userName: true,
        userEmail: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const modules = [
    {
      href: "/admin/questions",
      title: "Câu hỏi",
      desc: "Tạo và sửa câu hỏi (MCQ, gap fill, writing, speaking)",
      icon: HelpCircle,
      stat: `${questionCount} câu`,
    },
    {
      href: "/admin/papers",
      title: "Đề thi",
      desc: "Luyện tập, mock test, placement — tạo đề và gắn câu hỏi",
      icon: FileText,
      stat: `${paperCount} đề`,
    },
    {
      href: "/admin/users",
      title: "Tài khoản",
      desc: "Tạo và sửa học sinh, giáo viên, admin",
      icon: Users,
      stat: `${userCount} tài khoản`,
    },
    {
      href: "/admin/placement",
      title: "Kết quả Placement",
      desc: "Xem kết quả test trình độ (guest + đăng nhập)",
      icon: Target,
      stat: `${placementCount} lượt`,
    },
    {
      href: "/admin/reports",
      title: "Báo lỗi",
      desc: "Xem phản hồi và ảnh chụp màn hình từ người dùng",
      icon: Bug,
      stat: openReports > 0 ? `${openReports} mới` : "Không có mới",
      highlight: openReports > 0,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <LayoutDashboard className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-extrabold kid-gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Xin chào {session.user.name ?? session.user.email}
          </p>
        </div>
      </div>

      <AdminNav currentPath="/admin" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-purple-700">{userCount}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-emerald-700">{questionCount}</p>
          </CardContent>
        </Card>
        <Card className="border-sky-200 bg-sky-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Đề thi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-sky-700">{paperCount}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Báo lỗi mới</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-amber-700">{openReports}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 text-xl font-bold">Quản lý</h2>
      <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card
                className={`h-full transition-shadow hover:shadow-md ${
                  item.highlight ? "border-2 border-amber-400 ring-2 ring-amber-200" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5 text-purple-600" />
                      {item.title}
                    </CardTitle>
                    <Badge variant={item.highlight ? "default" : "secondary"}>{item.stat}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Báo lỗi gần đây</h2>
        <Link href="/admin/reports" className="text-sm font-semibold text-purple-600 hover:underline">
          Xem tất cả →
        </Link>
      </div>
      <Card className="mt-4">
        <CardContent className="divide-y pt-4">
          {recentReports.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Chưa có báo lỗi.</p>
          ) : (
            recentReports.map((r) => (
              <div key={r.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {r.userName ?? r.userEmail ?? "Ẩn danh"}
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{r.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <Badge variant={r.status === "OPEN" ? "default" : "outline"}>{r.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-8 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-semibold text-purple-800">
          <ClipboardList className="h-4 w-4" />
          Mẹo
        </p>
        <p className="mt-1">
          Người dùng báo lỗi qua nút <strong>Báo lỗi</strong> góc trái màn hình. Kiểm tra mục{" "}
          <Link href="/admin/reports" className="text-purple-600 underline">
            Báo lỗi
          </Link>{" "}
          thường xuyên.
        </p>
      </div>
    </div>
  );
}
