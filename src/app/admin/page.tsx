import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminPermissionsCard } from "@/components/admin/admin-permissions-card";
import { requireAdminPage, hasPermission } from "@/lib/admin/access";
import type { AdminPermission } from "@/lib/admin/permissions";
import {
  CreditCard,
  Bug,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Shield,
  Target,
  Users,
  LayoutTemplate,
} from "lucide-react";

const MODULES: {
  href: string;
  title: string;
  desc: string;
  icon: typeof HelpCircle;
  permission: AdminPermission;
  statKey?: string;
}[] = [
  {
    href: "/admin/questions",
    title: "Câu hỏi",
    desc: "Tạo và sửa câu hỏi (MCQ, gap fill, writing, speaking)",
    icon: HelpCircle,
    permission: "questions.manage",
    statKey: "questions",
  },
  {
    href: "/admin/papers",
    title: "Đề thi",
    desc: "Luyện tập, mock test, placement — tạo đề và gắn câu hỏi",
    icon: FileText,
    permission: "papers.manage",
    statKey: "papers",
  },
  {
    href: "/admin/users",
    title: "Tài khoản",
    desc: "Xem và quản lý học sinh, giáo viên, admin",
    icon: Users,
    permission: "users.view",
    statKey: "users",
  },
  {
    href: "/admin/placement",
    title: "Kết quả Placement",
    desc: "Xem kết quả test trình độ (guest + đăng nhập)",
    icon: Target,
    permission: "placement.view",
    statKey: "placement",
  },
  {
    href: "/admin/payments",
    title: "Thanh toán",
    desc: "Xác nhận chuyển khoản và kích hoạt gói Pro/VIP",
    icon: CreditCard,
    permission: "payments.manage",
    statKey: "pendingPayments",
  },
  {
    href: "/admin/reports",
    title: "Báo lỗi",
    desc: "Xem phản hồi và ảnh chụp màn hình từ người dùng",
    icon: Bug,
    permission: "reports.manage",
    statKey: "openReports",
  },
  {
    href: "/admin/roles",
    title: "Phân quyền Admin",
    desc: "Sửa vai trò và quyền cho từng cấp admin",
    icon: Shield,
    permission: "roles.manage",
  },
  {
    href: "/admin/footer",
    title: "Chân trang",
    desc: "Sửa menu và thông tin liên hệ ở cuối website",
    icon: LayoutTemplate,
    permission: "site.manage",
  },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { session, access } = await requireAdminPage("dashboard.view");
  const params = await searchParams;

  const stats = hasPermission(access, "users.view")
    ? await Promise.all([
        db.user.count(),
        db.question.count(),
        db.examPaper.count(),
        db.attempt.count({
          where: { paper: { paperKind: "PLACEMENT" }, status: { not: "IN_PROGRESS" } },
        }),
        db.bugReport.count({ where: { status: "OPEN" } }),
        db.paymentOrder.count({ where: { status: "PENDING" } }),
      ]).then(([users, questions, papers, placement, openReports, pendingPayments]) => ({
        users,
        questions,
        papers,
        placement,
        openReports,
        pendingPayments,
      }))
    : { users: 0, questions: 0, papers: 0, placement: 0, openReports: 0, pendingPayments: 0 };

  const recentReports = hasPermission(access, "reports.manage")
    ? await db.bugReport.findMany({
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
      })
    : [];

  const statMap: Record<string, string> = {
    users: `${stats.users} tài khoản`,
    questions: `${stats.questions} câu`,
    papers: `${stats.papers} đề`,
    placement: `${stats.placement} lượt`,
    openReports: stats.openReports > 0 ? `${stats.openReports} mới` : "Không có mới",
    pendingPayments:
      stats.pendingPayments > 0 ? `${stats.pendingPayments} chờ` : "Không có chờ",
  };

  const visibleModules = MODULES.filter((m) => hasPermission(access, m.permission));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <LayoutDashboard className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-extrabold kid-gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Xin chào {session.user.name ?? session.user.email} ·{" "}
            <Badge variant="outline">{access.roleName}</Badge>
          </p>
        </div>
      </div>

      {params.denied === "1" && (
        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Bạn không có quyền truy cập mục đó. Liên hệ Super Admin nếu cần thêm quyền.
        </div>
      )}

      <AdminNav currentPath="/admin" permissions={access.permissions} />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <AdminPermissionsCard access={access} showAllCatalog />
        {access.canManageRoles && (
          <Card className="border-2 border-violet-300 bg-violet-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Quản lý phân quyền
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Bạn là Super Admin — có thể chỉnh quyền cho từng cấp: Quản trị viên, Quản lý
                nội dung, Hỗ trợ, Phân tích...
              </p>
              <Link
                href="/admin/roles"
                className="inline-flex rounded-full bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700"
              >
                Mở trang Phân quyền →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {hasPermission(access, "users.view") && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-purple-700">{stats.users}</p>
            </CardContent>
          </Card>
          {hasPermission(access, "questions.manage") && (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold text-emerald-700">{stats.questions}</p>
              </CardContent>
            </Card>
          )}
          {hasPermission(access, "papers.manage") && (
            <Card className="border-sky-200 bg-sky-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Đề thi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold text-sky-700">{stats.papers}</p>
              </CardContent>
            </Card>
          )}
          {hasPermission(access, "reports.manage") && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Báo lỗi mới</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold text-amber-700">{stats.openReports}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <h2 className="mb-4 text-xl font-bold">Quản lý</h2>
      <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleModules.map((item) => {
          const Icon = item.icon;
          const highlight =
            (item.statKey === "openReports" && stats.openReports > 0) ||
            (item.statKey === "pendingPayments" && stats.pendingPayments > 0);
          return (
            <Link key={item.href} href={item.href}>
              <Card
                className={`h-full transition-shadow hover:shadow-md ${
                  highlight ? "border-2 border-amber-400 ring-2 ring-amber-200" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5 text-purple-600" />
                      {item.title}
                    </CardTitle>
                    {item.statKey && (
                      <Badge variant={highlight ? "default" : "secondary"}>
                        {statMap[item.statKey]}
                      </Badge>
                    )}
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

      {hasPermission(access, "reports.manage") && (
        <>
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
                    </div>
                    <Badge variant={r.status === "OPEN" ? "default" : "outline"}>{r.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-8 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-semibold text-purple-800">
          <ClipboardList className="h-4 w-4" />
          Phân quyền admin
        </p>
        <p className="mt-1">
          Hệ thống có 5 cấp admin mặc định: Super Admin, Quản trị viên, Quản lý nội dung, Hỗ trợ
          &amp; CSKH, Phân tích. Super Admin có thể chỉnh quyền tại{" "}
          <Link href="/admin/roles" className="text-purple-600 underline">
            Phân quyền
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
