"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  removeQuestionImageAction,
  updateQuestionImageDescriptionAction,
  uploadQuestionImageAction,
} from "@/lib/actions/question-image";
import { MAX_QUESTION_IMAGE_BYTES } from "@/lib/storage/question-image-upload";

type QuestionImageUploadProps = {
  questionId: string;
  imageUrl?: string | null;
  imageDescription?: string | null;
  imageHint?: string | null;
  onUpdated?: () => void;
};

export function QuestionImageUpload({
  questionId,
  imageUrl,
  imageDescription,
  imageHint,
  onUpdated,
}: QuestionImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [savingDesc, setSavingDesc] = useState(false);
  const [description, setDescription] = useState(imageDescription ?? "");
  const [currentUrl, setCurrentUrl] = useState(imageUrl ?? "");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_QUESTION_IMAGE_BYTES) {
      toast.error("Ảnh tối đa 1MB");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.set("questionId", questionId);
    formData.set("image", file);

    const result = await uploadQuestionImageAction(formData);
    setUploading(false);
    e.target.value = "";

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setCurrentUrl(result.imageUrl);
    toast.success("Đã upload ảnh");
    onUpdated?.();
  }

  async function handleRemove() {
    if (!confirm("Xóa ảnh khỏi câu hỏi này?")) return;
    setRemoving(true);
    const result = await removeQuestionImageAction(questionId);
    setRemoving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setCurrentUrl("");
    toast.success("Đã xóa ảnh");
    onUpdated?.();
  }

  async function handleSaveDescription() {
    setSavingDesc(true);
    const result = await updateQuestionImageDescriptionAction(questionId, description);
    setSavingDesc(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Đã lưu mô tả ảnh");
    onUpdated?.();
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-sky-200 bg-sky-50/60 p-4">
      <div>
        <p className="text-sm font-bold text-sky-900">🖼️ Minh họa câu hỏi</p>
        <p className="text-xs text-muted-foreground">
          JPG/PNG/WEBP · tối đa 1MB · chỉ hiện với câu cần ảnh
        </p>
      </div>

      {imageHint && (
        <p className="rounded-lg bg-white px-3 py-2 text-sm text-sky-900">
          <span className="font-semibold">Gợi ý nội dung ảnh: </span>
          {imageHint}
        </p>
      )}

      {currentUrl ? (
        <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg border bg-white">
          <Image
            src={currentUrl}
            alt={description || "Question illustration"}
            fill
            className="object-contain p-2"
            sizes="320px"
            unoptimized={currentUrl.startsWith("http") || currentUrl.startsWith("/uploads/")}
          />
        </div>
      ) : (
        <div className="flex min-h-[120px] max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-sky-300 bg-white text-sm text-muted-foreground">
          Chưa có ảnh — học sinh thấy emoji + mô tả
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-1 h-4 w-4" />
          )}
          {currentUrl ? "Thay ảnh" : "Upload ảnh"}
        </Button>
        {currentUrl && (
          <Button type="button" size="sm" variant="outline" disabled={removing} onClick={handleRemove}>
            {removing ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}
            Xóa ảnh
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`imageDescription-${questionId}`}>Mô tả ảnh (fallback khi chưa upload)</Label>
        <Input
          id={`imageDescription-${questionId}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="VD: A cat under a tree in a garden"
        />
        <Button type="button" size="sm" variant="outline" disabled={savingDesc} onClick={handleSaveDescription}>
          {savingDesc ? "Đang lưu..." : "Lưu mô tả"}
        </Button>
      </div>
    </div>
  );
}
