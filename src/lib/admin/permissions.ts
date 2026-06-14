export const ADMIN_PERMISSIONS = {
  "dashboard.view": {
    label: "Xem Admin Dashboard",
    group: "Tổng quan",
    description: "Truy cập trang tổng quan admin và thống kê cơ bản",
  },
  "questions.manage": {
    label: "Quản lý câu hỏi",
    group: "Nội dung",
    description: "Tạo, sửa, xóa câu hỏi luyện tập",
  },
  "papers.manage": {
    label: "Quản lý đề thi",
    group: "Nội dung",
    description: "Tạo đề, gắn câu hỏi, xuất bản đề thi",
  },
  "users.view": {
    label: "Xem tài khoản",
    group: "Người dùng",
    description: "Xem danh sách học sinh, giáo viên, admin",
  },
  "users.manage": {
    label: "Quản lý tài khoản",
    group: "Người dùng",
    description: "Tạo, sửa, xóa tài khoản người dùng",
  },
  "placement.view": {
    label: "Xem Placement",
    group: "Đánh giá",
    description: "Xem kết quả test trình độ",
  },
  "reports.manage": {
    label: "Quản lý báo lỗi",
    group: "Hỗ trợ",
    description: "Xem và xử lý báo lỗi từ người dùng",
  },
  "payments.manage": {
    label: "Quản lý thanh toán",
    group: "Kinh doanh",
    description: "Xác nhận thanh toán và kích hoạt gói",
  },
  "roles.manage": {
    label: "Quản lý phân quyền",
    group: "Hệ thống",
    description: "Sửa vai trò admin và phân quyền (chỉ Super Admin)",
  },
  "site.manage": {
    label: "Quản lý chân trang",
    group: "Hệ thống",
    description: "Sửa menu và thông tin liên hệ ở chân trang website",
  },
} as const;

export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

export const ALL_ADMIN_PERMISSIONS = Object.keys(
  ADMIN_PERMISSIONS
) as AdminPermission[];

export const PERMISSION_GROUPS = [
  "Tổng quan",
  "Nội dung",
  "Người dùng",
  "Đánh giá",
  "Hỗ trợ",
  "Kinh doanh",
  "Hệ thống",
] as const;

export const ROUTE_PERMISSIONS: Record<string, AdminPermission> = {
  "/admin": "dashboard.view",
  "/admin/questions": "questions.manage",
  "/admin/papers": "papers.manage",
  "/admin/users": "users.view",
  "/admin/placement": "placement.view",
  "/admin/reports": "reports.manage",
  "/admin/payments": "payments.manage",
  "/admin/roles": "roles.manage",
  "/admin/footer": "site.manage",
};

export const SUPER_ADMIN_SLUG = "super-admin";

export function permissionLabel(key: AdminPermission): string {
  return ADMIN_PERMISSIONS[key]?.label ?? key;
}

export function permissionsByGroup(): Record<string, AdminPermission[]> {
  const map: Record<string, AdminPermission[]> = {};
  for (const key of ALL_ADMIN_PERMISSIONS) {
    const group = ADMIN_PERMISSIONS[key].group;
    if (!map[group]) map[group] = [];
    map[group].push(key);
  }
  return map;
}

export function hasPermission(
  access: { permissions: AdminPermission[] } | AdminPermission[],
  permission: AdminPermission
): boolean {
  const perms = Array.isArray(access) ? access : access.permissions;
  return perms.includes(permission);
}
