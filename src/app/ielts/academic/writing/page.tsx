import Link from "next/link";
import { loadIeltsWritingHub } from "@/lib/ielts/ielts-hub-data";
import { IeltsWritingHubClient } from "@/components/ielts/ielts-writing-hub-client";
import { IeltsModuleBadge } from "@/components/ielts/ielts-module-badge";
import { CambaMascot } from "@/components/kids/camba-mascot";

import { IeltsAcademicHubHeader } from "@/components/inline-edit/page-editable-sections";

export const revalidate = 60;

export default async function IeltsAcademicWritingPage() {
  const data = await loadIeltsWritingHub("ACADEMIC");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <Link href="/exams" className="text-sm font-semibold text-purple-600 hover:underline">
            ← Chọn level
          </Link>
          <IeltsAcademicHubHeader
            skill="writing"
            defaultTitle={data.meta.hubTitle("Writing")}
            defaultDescription={`${data.meta.description} · Task 1 Academic (biểu đồ/bản đồ/sơ đồ) + Task 2 Essay · AI chấm band ngay`}
            badge={<IeltsModuleBadge module={data.module} />}
          />
        </div>
      </div>

      <IeltsWritingHubClient
        module={data.module}
        usage={data.usage}
        practiceParts={data.practiceParts}
        mockBankStats={data.mockBankStats}
        mockPaper={data.mockPaper}
      />
    </div>
  );
}
