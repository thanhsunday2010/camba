"use client";

import { EditableText } from "@/components/inline-edit/editable-text";

export function ExamsHubHeading() {
  return (
    <EditableText
      contentKey="exams.hub.title"
      defaultValue="Chọn level luyện tập"
      as="h1"
      className="text-3xl font-extrabold kid-gradient-text"
    />
  );
}

export function ExamsHubIntro({ levelLabel }: { levelLabel: React.ReactNode }) {
  return (
    <p className="mt-1 max-w-xl font-semibold text-muted-foreground">
      <EditableText
        contentKey="exams.hub.intro"
        defaultValue="Bạn có thể đổi level bất cứ lúc nào — không cần tạo tài khoản mới. Level mặc định hiện tại:"
        as="span"
      />{" "}
      <strong className="text-purple-700">{levelLabel}</strong>
    </p>
  );
}
