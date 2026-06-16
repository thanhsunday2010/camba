"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Bug, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitBugReportAction } from "@/lib/actions/bug-report";
import { VTEN_COURSE_LABEL, VTEN_COURSE_URL } from "@/lib/site/vten-course";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/admin", "/login", "/register", "/teacher"];

function FloatCtaShell({
  children,
  onDismiss,
  dismissLabel,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label={dismissLabel}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function BugReportButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showVten, setShowVten] = useState(true);
  const [showBug, setShowBug] = useState(true);

  useEffect(() => {
    setShowVten(true);
    setShowBug(true);
  }, [pathname]);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  if (hidden) return null;

  if (!showVten && !showBug && !open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("pageUrl", window.location.href);
    const result = await submitBugReportAction(fd);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Đã gửi báo lỗi. Cảm ơn bạn! 🐰");
      setOpen(false);
      setPreview(null);
      e.currentTarget.reset();
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh tối đa 2MB");
      e.target.value = "";
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  return (
    <>
      {(showVten || showBug) && (
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2 md:bottom-6 md:left-6">
        {showVten && (
          <FloatCtaShell onDismiss={() => setShowVten(false)} dismissLabel="Đóng gợi ý khóa học">
            <a
              href={VTEN_COURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border-2 border-sky-300 bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-2 text-xs font-normal text-sky-900 shadow-lg transition-transform hover:scale-105"
            >
              👩‍🏫 {VTEN_COURSE_LABEL}
            </a>
          </FloatCtaShell>
        )}
        {showBug && (
          <FloatCtaShell onDismiss={() => setShowBug(false)} dismissLabel="Đóng nút báo lỗi">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 text-xs font-normal text-amber-900 shadow-lg transition-transform hover:scale-105"
              aria-label="Báo lỗi"
            >
              <Bug className="h-4 w-4" />
              Báo lỗi
            </button>
          </FloatCtaShell>
        )}
      </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bug-report-title"
        >
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-purple-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-slate-100"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id="bug-report-title" className="mb-1 text-xl font-extrabold text-purple-900">
              Báo lỗi / góp ý
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Mô tả lỗi bạn gặp. Có thể đính kèm ảnh chụp màn hình (tối đa 2MB).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bug-message">Nội dung *</Label>
                <Textarea
                  id="bug-message"
                  name="message"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Ví dụ: Câu 5 không hiển thị hình ảnh khi làm bài KET Reading..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bug-image">Ảnh minh hoạ (tuỳ chọn)</Label>
                <input
                  id="bug-image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className={cn(
                    "mt-1 block w-full text-sm text-muted-foreground",
                    "file:mr-3 file:rounded-full file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700"
                  )}
                />
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Xem trước"
                    className="mt-2 max-h-40 rounded-lg border object-contain"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi báo cáo"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Huỷ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
