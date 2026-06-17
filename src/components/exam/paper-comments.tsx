"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createPaperCommentAction,
  type PaperCommentView,
} from "@/lib/actions/paper-comments";

interface PaperCommentsProps {
  paperId: string;
  initialComments: PaperCommentView[];
  currentUserId: string;
  currentUserName?: string | null;
}

function formatCommentTime(date: Date): string {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaperComments({
  paperId,
  initialComments,
  currentUserId,
  currentUserName,
}: PaperCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    startTransition(async () => {
      const result = await createPaperCommentAction(paperId, trimmed);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if (result.ok && result.comment) {
        setComments((prev) => [result.comment, ...prev]);
        setBody("");
        toast.success("Đã gửi bình luận");
      }
    });
  }

  return (
    <section className="mx-auto mb-8 max-w-4xl rounded-2xl border-2 border-purple-100 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-lg font-extrabold text-purple-900">💬 Bình luận về đề</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Chia sẻ kinh nghiệm, ghi chú hoặc hỏi đáp về đề này
      </p>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Viết bình luận..."
          rows={3}
          maxLength={2000}
          disabled={pending}
          className="resize-y border-purple-100"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{body.length}/2000</span>
          <Button type="submit" className="rounded-full" disabled={pending || !body.trim()}>
            {pending ? "Đang gửi..." : "Gửi bình luận"}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có bình luận — hãy là người đầu tiên!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const isOwn = comment.user.id === currentUserId;
            const displayName =
              comment.user.name ?? (isOwn ? currentUserName ?? "Bạn" : "Học viên");

            return (
              <li
                key={comment.id}
                className="rounded-xl border border-purple-50 bg-purple-50/40 px-4 py-3"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold text-purple-900">{displayName}</span>
                  {isOwn && (
                    <span className="rounded-full bg-purple-200 px-2 py-0.5 text-xs font-semibold text-purple-800">
                      Bạn
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatCommentTime(comment.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {comment.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
