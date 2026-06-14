import { PlacementStartCard } from "@/components/placement/placement-start-card";
import { PlacementRecentAttempts } from "@/components/placement/placement-recent-attempts";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { getPublishedPlacementPapers } from "@/lib/exam/cached-papers";

export const revalidate = 3600;

export default async function PlacementPage() {
  const papers = await getPublishedPlacementPapers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="think" />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold kid-gradient-text">Test trình độ</h1>
          <p className="mt-2 font-semibold leading-relaxed text-muted-foreground">
            Làm bài placement miễn phí — <strong>không cần đăng ký</strong> (chỉ cần Họ tên & SĐT).
            Kết quả CEFR và cấp độ Cambridge chi tiết từng kỹ năng.
          </p>
        </div>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {papers.map((paper) => (
          <PlacementStartCard
            key={paper.id}
            paper={{
              id: paper.id,
              title: paper.title,
              description: paper.description,
              timeLimit: paper.timeLimit,
            }}
          />
        ))}
      </div>

      <PlacementRecentAttempts />
    </div>
  );
}
