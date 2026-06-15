import { PlacementCategorySection } from "@/components/placement/placement-category-section";
import { PlacementRecentAttempts } from "@/components/placement/placement-recent-attempts";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { getPublishedPlacementPapers } from "@/lib/exam/cached-papers";
import { getSession } from "@/lib/auth-session";
import { getPlacementWeeklySnapshot } from "@/lib/subscription/placement-limit";
import {
  groupPlacementPapersByCategory,
  PLACEMENT_CATEGORY_ORDER,
} from "@/lib/placement/categories";

export const dynamic = "force-dynamic";

export default async function PlacementPage() {
  const [papers, session] = await Promise.all([
    getPublishedPlacementPapers(),
    getSession(),
  ]);

  const placementUsage = session?.user?.id
    ? await getPlacementWeeklySnapshot(session.user.id)
    : null;

  const grouped = groupPlacementPapersByCategory(papers);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="think" />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold kid-gradient-text">Test trình độ</h1>
          <p className="mt-2 font-semibold leading-relaxed text-muted-foreground">
            Chọn nhóm placement phù hợp — <strong>IELTS</strong>,{" "}
            <strong>Cambridge</strong> hoặc <strong>General English</strong>.
            {session?.user?.id ? (
              <> Tài khoản: <strong>2 lượt placement/tuần</strong> (mọi loại đề).</>
            ) : (
              <>
                {" "}
                Khách không cần đăng ký (Họ tên & SĐT) — <strong>1 lượt/tháng</strong> theo SĐT.
              </>
            )}
          </p>
        </div>
      </div>

      {!session?.user?.id && (
        <p className="mb-6 rounded-xl border-2 border-purple-100 bg-purple-50/80 px-4 py-3 text-sm font-semibold text-purple-900">
          Khách (không đăng ký): <strong>1 lượt placement/tháng</strong> theo số điện thoại, áp dụng
          mọi loại đề.{" "}
          <a href="/register" className="font-bold underline">
            Đăng ký miễn phí
          </a>{" "}
          để làm thêm (2 lượt/tuần).
        </p>
      )}

      {placementUsage && !placementUsage.unlimited && placementUsage.limit != null && (
        <p className="mb-6 rounded-xl border-2 border-sky-100 bg-sky-50/80 px-4 py-3 text-sm font-semibold text-sky-900">
          Tuần này bạn còn{" "}
          <strong>{placementUsage.remaining}</strong>/{placementUsage.limit} lượt placement
          tuần này (gói {placementUsage.planName}) — áp dụng mọi nhóm đề. Tiếp tục bài đang dở
          không tính thêm lượt.
        </p>
      )}

      {papers.length === 0 ? (
        <div className="mb-12 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-6 text-center">
          <p className="font-bold text-amber-900">Chưa có bài placement trên hệ thống.</p>
          <p className="mt-2 text-sm text-amber-800">
            Admin chạy <code className="rounded bg-white px-1">npm run content:reseed-placement</code>{" "}
            để tạo đề.
          </p>
        </div>
      ) : (
        <div className="mb-12 space-y-10">
          {PLACEMENT_CATEGORY_ORDER.map((categoryId) => (
            <PlacementCategorySection
              key={categoryId}
              categoryId={categoryId}
              papers={grouped[categoryId]}
              placementRemaining={placementUsage?.remaining ?? null}
              placementLimit={placementUsage?.limit ?? null}
            />
          ))}
        </div>
      )}

      <PlacementRecentAttempts />
    </div>
  );
}
