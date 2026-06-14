import { AdminNav } from "@/components/admin/admin-nav";
import { FooterSettingsClient } from "@/components/admin/footer-settings-client";
import { requireAdminPage } from "@/lib/admin/access";
import { getFooterSettings } from "@/lib/site/get-footer-settings";

export const metadata = {
  title: "Chân trang | Admin Camba",
};

export default async function AdminFooterPage() {
  const { access } = await requireAdminPage("site.manage");
  const settings = await getFooterSettings();

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNav currentPath="/admin/footer" permissions={access.permissions} />
      <h1 className="mb-2 text-3xl font-extrabold kid-gradient-text">Chân trang website</h1>
      <p className="mb-8 text-muted-foreground">
        Sửa menu, mô tả và thông tin liên hệ hiển thị ở cuối mọi trang
      </p>
      <FooterSettingsClient initialSettings={settings} />
    </div>
  );
}
