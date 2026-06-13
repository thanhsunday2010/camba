"use client";

import { QuestionType } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AudioPlayer } from "./audio-player";
import { AudioRecorder } from "./audio-recorder";
import type {
  FreeTextContent,
  GapFillContent,
  McqContent,
  SpeakingContent,
} from "@/lib/exam/scoring";
import { cn } from "@/lib/utils";

interface QuestionData {
  id: string;
  type: QuestionType;
  content: unknown;
  audioUrl?: string | null;
  points: number;
}

interface QuestionRendererProps {
  question: QuestionData;
  index: number;
  value: unknown;
  onChange: (value: unknown) => void;
  onSpeakingTranscript?: (text: string) => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  index,
  value,
  onChange,
  onSpeakingTranscript,
  disabled,
}: QuestionRendererProps) {
  const content = question.content as McqContent | GapFillContent | FreeTextContent | SpeakingContent;

  return (
    <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-cambridge-900">
          Câu {index + 1}
        </h3>
        <span className="text-sm text-muted-foreground">{question.points} điểm</span>
      </div>

      {question.audioUrl && (
        <AudioPlayer src={question.audioUrl} title="Nghe audio" />
      )}

      {question.type === "MCQ" && (
        <McqQuestion
          content={content as McqContent}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {question.type === "GAP_FILL" && (
        <GapFillQuestion
          content={content as GapFillContent}
          value={value as string[]}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {question.type === "FREE_TEXT" && (
        <FreeTextQuestion
          content={content as FreeTextContent}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {question.type === "SPEAKING_PROMPT" && (
        <SpeakingQuestion
          content={content as SpeakingContent}
          onSpeakingTranscript={onSpeakingTranscript}
          disabled={disabled}
        />
      )}
    </div>
  );
}

function McqQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: McqContent;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      {content.passage && (
        <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {content.passage}
        </div>
      )}
      <p className="font-medium">{content.question}</p>
      <div className="space-y-2">
        {content.options.map((opt, i) => (
          <label
            key={i}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
              value === opt ? "border-cambridge-500 bg-cambridge-50" : "hover:bg-slate-50",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <input
              type="radio"
              name="mcq"
              checked={value === opt}
              onChange={() => onChange(opt)}
              disabled={disabled}
              className="accent-cambridge-600"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function GapFillQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: GapFillContent;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const answers = value ?? Array(content.blanks).fill("");

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {content.passage}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: content.blanks }).map((_, i) => (
          <div key={i}>
            <Label>Blank {i + 1}</Label>
            <input
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              value={answers[i] ?? ""}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                onChange(next);
              }}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FreeTextQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: FreeTextContent;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const wordCount = (value ?? "").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {content.instructions && (
        <p className="text-sm text-muted-foreground">{content.instructions}</p>
      )}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <p className="font-medium text-amber-900 whitespace-pre-wrap">{content.taskPrompt}</p>
      </div>
      <Textarea
        rows={10}
        placeholder="Write your answer in English..."
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{wordCount} từ</span>
        {content.wordLimit && <span>Giới hạn: {content.wordLimit} từ</span>}
      </div>
    </div>
  );
}

function SpeakingQuestion({
  content,
  onSpeakingTranscript,
  disabled,
}: {
  content: SpeakingContent;
  onSpeakingTranscript?: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
        <p className="font-medium whitespace-pre-wrap">{content.prompt}</p>
        {(content.preparationTime || content.speakingTime) && (
          <p className="mt-2 text-sm text-purple-700">
            {content.preparationTime && `Chuẩn bị: ${content.preparationTime}s`}
            {content.speakingTime && ` | Nói: ${content.speakingTime}s`}
          </p>
        )}
      </div>
      <AudioRecorder
        onTranscript={(text) => onSpeakingTranscript?.(text)}
        disabled={disabled}
      />
    </div>
  );
}
