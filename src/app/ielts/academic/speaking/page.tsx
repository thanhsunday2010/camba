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
    <div className="page-shell">
      <div className="page-hero">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <Link href="/exams" className="text-sm font-semibold text-purple-600 hover:underline">
            ← Chọn level
          </Link>
          <IeltsAcademicHubHeader
            skill="speaking"
            defaultTitle={data.meta.hubTitle("Speaking")}
            defaultDescription="Part 1–3 · AI chấm band ngay"
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
