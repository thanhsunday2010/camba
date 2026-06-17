"use client";

import { EditableText } from "@/components/inline-edit/editable-text";

export function ExamsHubHeading() {
  return (
    <EditableText
      contentKey="exams.hub.title"
      defaultValue="Chọn level luyện tập"
      as="h1"
      className="page-title"
    />
  );
}

export function ExamsHubIntro({ levelLabel }: { levelLabel: React.ReactNode }) {
  return (
    <p className="page-subtitle">
      <EditableText
        contentKey="exams.hub.intro"
        defaultValue="Đổi level bất cứ lúc nào · Mặc định:"
        as="span"
      />{" "}
      <strong className="text-purple-700">{levelLabel}</strong>
    </p>
  );
}
