"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { IeltsModuleBadge } from "@/components/ielts/ielts-module-badge";
import {
  IELTS_ACADEMIC_SPEAKING_URL,
  IELTS_ACADEMIC_WRITING_URL,
} from "@/lib/exam/ielts-module";
import { EditableText } from "@/components/inline-edit/editable-text";

export function ExamsHubIeltsSection({
  speakingTitle,
  speakingDescription,
  writingTitle,
  writingDescription,
  generalDescription,
}: {
  speakingTitle: string;
  speakingDescription: string;
  writingTitle: string;
  writingDescription: string;
  generalDescription: string;
}) {
  return (
    <>
      <div className="mt-8 mb-2 flex flex-wrap items-center gap-2">
        <EditableText
          contentKey="exams.ielts.sectionTitle"
          defaultValue="IELTS — Luyện Speaking & Writing"
          as="h2"
          className="text-lg font-extrabold text-slate-800"
        />
        <IeltsModuleBadge module="ACADEMIC" />
      </div>

      <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50/60 to-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <EditableText
                contentKey="exams.ielts.speaking.cardTitle"
                defaultValue={`🎤 ${speakingTitle}`}
                as="p"
                className="text-lg font-extrabold text-rose-800"
              />
              <IeltsModuleBadge module="ACADEMIC" size="sm" />
            </div>
            <EditableText
              contentKey="exams.ielts.speaking.cardDescription"
              defaultValue={speakingDescription}
              as="p"
              multiline
              className="mt-1 max-w-xl text-sm font-medium text-muted-foreground"
            />
          </div>
          <Link
            href={IELTS_ACADEMIC_SPEAKING_URL}
            className="kid-btn-fun inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
          >
            <EditableText
              contentKey="exams.ielts.speaking.cta"
              defaultValue="Vào luyện Speaking Academic"
              as="span"
            />
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-4 border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 to-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <EditableText
                contentKey="exams.ielts.writing.cardTitle"
                defaultValue={`✏️ ${writingTitle}`}
                as="p"
                className="text-lg font-extrabold text-amber-900"
              />
              <IeltsModuleBadge module="ACADEMIC" size="sm" />
            </div>
            <EditableText
              contentKey="exams.ielts.writing.cardDescription"
              defaultValue={writingDescription}
              as="p"
              multiline
              className="mt-1 max-w-xl text-sm font-medium text-muted-foreground"
            />
          </div>
          <Link
            href={IELTS_ACADEMIC_WRITING_URL}
            className="kid-btn-fun inline-flex rounded-full bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            <EditableText
              contentKey="exams.ielts.writing.cta"
              defaultValue="Vào luyện Writing Academic"
              as="span"
            />
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-4 border-2 border-dashed border-teal-200 bg-teal-50/40 opacity-90">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <EditableText
                contentKey="exams.ielts.general.cardTitle"
                defaultValue="IELTS General Training — Speaking & Writing"
                as="p"
                className="text-base font-extrabold text-teal-900"
              />
              <IeltsModuleBadge module="GENERAL" size="sm" />
            </div>
            <EditableText
              contentKey="exams.ielts.general.cardDescription"
              defaultValue={generalDescription}
              as="p"
              multiline
              className="mt-1 max-w-xl text-sm font-medium text-muted-foreground"
            />
          </div>
          <EditableText
            contentKey="exams.ielts.general.badge"
            defaultValue="Sắp ra mắt"
            as="span"
            className="rounded-full bg-teal-100 px-4 py-2 text-sm font-bold text-teal-800"
          />
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        <EditableText
          contentKey="exams.footer.placementHint"
          defaultValue="Muốn biết trình độ?"
          as="span"
        />{" "}
        <Link href="/placement" className="font-bold text-purple-600 underline">
          <EditableText
            contentKey="exams.footer.placementLink"
            defaultValue="Làm bài test trình độ"
            as="span"
          />
        </Link>
      </p>
    </>
  );
}
