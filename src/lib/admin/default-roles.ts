import type { AdminPermission } from "@/lib/admin/permissions";

export interface DefaultAdminRoleSeed {
  slug: string;
  name: string;
  description: string;
  permissions: AdminPermission[];
  sortOrder: number;
}

export const DEFAULT_ADMIN_ROLES: DefaultAdminRoleSeed[] = [
  {
    slug: "super-admin",
    name: "Super Admin",
    description: "Toàn quyền hệ thống, bao gồm sửa phân quyền admin",
    permissions: [
      "dashboard.view",
      "questions.manage",
      "papers.manage",
      "users.view",
      "users.manage",
      "placement.view",
      "reports.manage",
      "payments.manage",
      "roles.manage",
    ],
    sortOrder: 0,
  },
  {
    slug: "admin",
    name: "Quản trị viên",
    description: "Quản lý đầy đủ nội dung, người dùng, thanh toán — không sửa phân quyền",
    permissions: [
      "dashboard.view",
      "questions.manage",
      "papers.manage",
      "users.view",
      "users.manage",
      "placement.view",
      "reports.manage",
      "payments.manage",
    ],
    sortOrder: 1,
  },
  {
    slug: "content-manager",
    name: "Quản lý nội dung",
    description: "Chỉ quản lý câu hỏi và đề thi",
    permissions: ["dashboard.view", "questions.manage", "papers.manage"],
    sortOrder: 2,
  },
  {
    slug: "support",
    name: "Hỗ trợ & CSKH",
    description: "Xử lý báo lỗi, thanh toán, xem tài khoản",
    permissions: [
      "dashboard.view",
      "users.view",
      "reports.manage",
      "payments.manage",
    ],
    sortOrder: 3,
  },
  {
    slug: "analyst",
    name: "Phân tích",
    description: "Xem dashboard và kết quả placement (chỉ đọc)",
    permissions: ["dashboard.view", "placement.view"],
    sortOrder: 4,
  },
];
