import { NextRequest, NextResponse } from "next/server";

/** @deprecated Lời giải đã chuyển sang explanationVi trong DB — không còn gọi AI on-demand */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "AI giải thích on-demand đã tắt. Lời giải hiển thị tự động từ ngân hàng câu hỏi khi làm bài luyện tập.",
    },
    { status: 410 }
  );
}
