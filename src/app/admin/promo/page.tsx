import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { PromoCodesClient } from "@/components/admin/promo-codes-client";
import { getAdminAccess, requireAdminPage } from "@/lib/admin/access";
import { db } from "@/lib/db";

export const metadata = {
  title: "Mã ưu đãi | Admin Camba",
};

export default async function AdminPromoPage() {
  const { session, access } = await requireAdminPage("dashboard.view");
  const fullAccess = await getAdminAccess(session.user.id);
  if (!fullAccess || fullAccess.roleSlug !== "super-admin") {
    redirect("/admin?denied=1");
  }

  const codes = await db.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNav currentPath="/admin/promo" permissions={access.permissions} roleSlug={fullAccess.roleSlug} />
      <h1 className="mb-2 text-3xl font-extrabold kid-gradient-text">Mã ưu đãi</h1>
      <p className="mb-8 text-muted-foreground">
        Quản lý mã, quyền lợi và popup — chỉ Super Admin
      </p>
      <PromoCodesClient initialCodes={codes} />
    </div>
  );
}
