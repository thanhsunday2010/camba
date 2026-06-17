import Link from "next/link";
import { loadIeltsSpeakingHub } from "@/lib/ielts/ielts-hub-data";
import { IeltsSpeakingHubClient } from "@/components/ielts/ielts-speaking-hub-client";
import { IeltsModuleBadge } from "@/components/ielts/ielts-module-badge";
import { CambaMascot } from "@/components/kids/camba-mascot";

import { IeltsAcademicHubHeader } from "@/components/inline-edit/page-editable-sections";

export const revalidate = 60;

export default async function IeltsAcademicSpeakingPage() {
  const data = await loadIeltsSpeakingHub("ACADEMIC");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <Link href="/exams" className="text-sm font-semibold text-purple-600 hover:underline">
            ← Chọn level
          </Link>
          <IeltsAcademicHubHeader
            skill="speaking"
            defaultTitle={data.meta.hubTitle("Speaking")}
            defaultDescription={`${data.meta.description} · Mỗi lần luyện 1 câu ngẫu nhiên · AI chấm band ngay · mock full Part 1+2+3`}
            badge={<IeltsModuleBadge module={data.module} />}
          />
        </div>
      </div>

      <IeltsSpeakingHubClient
        module={data.module}
        usage={data.usage}
        practiceParts={data.practiceParts}
        mockBankStats={data.mockBankStats}
        mockPaper={data.mockPaper}
      />
    </div>
  );
}
