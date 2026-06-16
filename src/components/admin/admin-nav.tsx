import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ROUTE_PERMISSIONS,
  SUPER_ADMIN_SLUG,
  type AdminPermission,
} from "@/lib/admin/permissions";
import { hasPermission } from "@/lib/admin/permissions";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true, permission: "dashboard.view" as AdminPermission },
  { href: "/admin/questions", label: "Câu hỏi", permission: "questions.manage" as AdminPermission },
  { href: "/admin/question-images", label: "Ảnh câu hỏi", permission: "questions.manage" as AdminPermission },
  { href: "/admin/papers", label: "Đề thi", permission: "papers.manage" as AdminPermission },
  { href: "/admin/users", label: "Tài khoản", permission: "users.view" as AdminPermission },
  { href: "/admin/placement", label: "Placement", permission: "placement.view" as AdminPermission },
  { href: "/admin/reports", label: "Báo lỗi", permission: "reports.manage" as AdminPermission },
  { href: "/admin/payments", label: "Thanh toán", permission: "payments.manage" as AdminPermission },
  { href: "/admin/promo", label: "Mã ưu đãi", permission: "dashboard.view" as AdminPermission, superAdminOnly: true },
  { href: "/admin/roles", label: "Phân quyền", permission: "roles.manage" as AdminPermission },
  { href: "/admin/footer", label: "Chân trang", permission: "site.manage" as AdminPermission },
];

export function AdminNav({
  currentPath,
  permissions,
  roleSlug,
}: {
  currentPath: string;
  permissions: AdminPermission[];
  roleSlug?: string | null;
}) {
  const isSuperAdmin = roleSlug === SUPER_ADMIN_SLUG;
  const visible = LINKS.filter((link) => {
    if (link.superAdminOnly && !isSuperAdmin) return false;
    const required = ROUTE_PERMISSIONS[link.href] ?? link.permission;
    return hasPermission(permissions, required);
  });

  return (
    <nav className="mb-8 flex flex-wrap gap-2 rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-2">
      {visible.map((link) => {
        const active =
          link.exact ? currentPath === link.href : currentPath.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition-colors",
              active
                ? "bg-purple-600 text-white shadow"
                : "text-purple-800 hover:bg-purple-100"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
