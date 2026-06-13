"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXAM_LEVELS, SKILLS, QUESTION_TYPES } from "@/lib/constants";
import { createQuestionAction, updateQuestionAction } from "@/lib/actions/exam";

export type QuestionFormData = {
  id: string;
  type: string;
  level: string;
  skill: string;
  title: string | null;
  points: number;
  content: unknown;
  correctAnswer: unknown;
  audioUrl: string | null;
};

const defaultContent: Record<string, string> = {
  MCQ: JSON.stringify(
    {
      passage: "Tom likes playing football every weekend.",
      question: "What does Tom like?",
      options: ["Swimming", "Football", "Reading", "Music"],
    },
    null,
    2
  ),
  GAP_FILL: JSON.stringify(
    { passage: "My name ___ Anna. I am ten years old.", blanks: 1 },
    null,
    2
  ),
  FREE_TEXT: JSON.stringify(
    {
      taskPrompt: "Write an email to your friend about your weekend. Write 25-35 words.",
      wordLimit: 35,
      instructions: "Use past tense.",
    },
    null,
    2
  ),
  SPEAKING_PROMPT: JSON.stringify(
    { prompt: "Describe your favourite hobby. Speak for 1 minute.", speakingTime: 60 },
    null,
    2
  ),
};

export function formatQuestionJson(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function QuestionForm({
  question,
  mode = "edit",
  onDone,
  compact = false,
}: {
  question?: QuestionFormData;
  mode?: "create" | "edit";
  onDone: () => void;
  compact?: boolean;
}) {
  const isEdit = mode === "edit" && Boolean(question);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(question?.type ?? "MCQ");
  const [level, setLevel] = useState(question?.level ?? "KET");
  const [skill, setSkill] = useState(question?.skill ?? "READING");

  const formType = question?.type ?? type;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (!isEdit) {
      formData.set("type", type);
      formData.set("level", level);
      formData.set("skill", skill);
    }
    if (isEdit && question) formData.set("id", question.id);

    const result = isEdit
      ? await updateQuestionAction(formData)
      : await createQuestionAction(formData);

    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(isEdit ? "Đã cập nhật câu hỏi" : "Đã tạo câu hỏi");
      if (!isEdit) e.currentTarget.reset();
      onDone();
    }
  }

  return (
    <form
      key={question?.id ?? `create-${type}`}
      onSubmit={handleSubmit}
      className={compact ? "space-y-3" : "space-y-4"}
    >
      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Loại</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cấp độ</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXAM_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {isEdit && question && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Loại</Label>
            <select
              name="type"
              defaultValue={question.type}
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Cấp độ</Label>
            <select
              name="level"
              defaultValue={question.level}
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
            >
              {EXAM_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <Label>Kỹ năng</Label>
        {isEdit && question ? (
          <select
            name="skill"
            defaultValue={question.skill}
            className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
          >
            {SKILLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <Select value={skill} onValueChange={setSkill}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SKILLS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label htmlFor={`title-${question?.id ?? "new"}`}>Tiêu đề (tuỳ chọn)</Label>
        <Input
          id={`title-${question?.id ?? "new"}`}
          name="title"
          defaultValue={question?.title ?? ""}
        />
      </div>
      <div>
        <Label htmlFor={`content-${question?.id ?? "new"}`}>Nội dung (JSON)</Label>
        <Textarea
          id={`content-${question?.id ?? "new"}`}
          name="content"
          rows={compact ? 6 : 8}
          defaultValue={
            isEdit && question
              ? formatQuestionJson(question.content)
              : defaultContent[formType]
          }
          required
        />
      </div>
      <div>
        <Label htmlFor={`correctAnswer-${question?.id ?? "new"}`}>
          Đáp án đúng (JSON, tuỳ chọn)
        </Label>
        <Input
          id={`correctAnswer-${question?.id ?? "new"}`}
          name="correctAnswer"
          defaultValue={isEdit && question ? formatQuestionJson(question.correctAnswer) : ""}
          placeholder='"Football" hoặc ["word1"]'
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`points-${question?.id ?? "new"}`}>Điểm</Label>
          <Input
            id={`points-${question?.id ?? "new"}`}
            name="points"
            type="number"
            defaultValue={question?.points ?? 1}
          />
        </div>
        <div>
          <Label htmlFor={`audioUrl-${question?.id ?? "new"}`}>Audio URL (Listening)</Label>
          <Input
            id={`audioUrl-${question?.id ?? "new"}`}
            name="audioUrl"
            defaultValue={question?.audioUrl ?? ""}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size={compact ? "sm" : "default"}>
          {loading ? "Đang lưu..." : isEdit ? "Lưu câu hỏi" : "Tạo câu hỏi"}
        </Button>
        {isEdit && (
          <Button type="button" variant="outline" size={compact ? "sm" : "default"} onClick={onDone}>
            Huỷ
          </Button>
        )}
      </div>
    </form>
  );
}
