import { auth } from "@/auth";
import { getAdminAccess, isSuperAdminRole } from "@/lib/admin/access";
import { getInlineContent } from "@/lib/site/get-inline-content";
import { InlineEditProvider } from "@/components/inline-edit/inline-edit-provider";

export async function InlineEditBootstrap({ children }: { children: React.ReactNode }) {
  const [session, stored] = await Promise.all([auth(), getInlineContent()]);

  let canEdit = false;
  if (session?.user?.id && session.user.role === "ADMIN") {
    const access = await getAdminAccess(session.user.id);
    canEdit = isSuperAdminRole(access?.roleSlug);
  }

  return (
    <InlineEditProvider canEdit={canEdit} initialStored={stored}>
      {children}
    </InlineEditProvider>
  );
}
