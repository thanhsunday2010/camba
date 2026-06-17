"use client";

import { useState } from "react";
import Link from "next/link";
import { QuestionType } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "./audio-player";
import { AudioRecorder } from "./audio-recorder";
import { QuestionIllustration } from "./question-illustration";
import type {
  FreeTextContent,
  GapFillContent,
  McqContent,
  SpeakingContent,
} from "@/lib/exam/scoring";
import { resolveMcqMedia } from "@/lib/exam/question-media";
import { stripListeningScriptFromQuestion, normalizeListeningTranscript } from "@/lib/exam/listening-display";
import { getSpeakingPromptText } from "@/lib/exam/speaking-audio";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { QuestionExplanationPanel } from "@/components/exam/question-explanation-panel";
import {
  PracticeObjectiveFeedback,
  type ObjectiveFeedback,
} from "@/components/exam/practice-objective-feedback";
import {
  formatWritingWordLimitHint,
  getWritingSubmissionWordLimit,
} from "@/lib/exam/writing-word-limit";

interface QuestionData {
  id: string;
  type: QuestionType;
  content: unknown;
  audioUrl?: string | null;
  points: number;
  title?: string | null;
  correctAnswer?: unknown;
}

interface QuestionRendererProps {
  question: QuestionData;
  index: number;
  value: unknown;
  onChange: (value: unknown) => void;
  onSpeakingTranscript?: (text: string) => void;
  disabled?: boolean;
  isListening?: boolean;
  maxSpeakingWords?: number;
  objectiveFeedback?: ObjectiveFeedback | null;
  lockObjectiveAnswer?: boolean;
  practiceMinWords?: number | null;
  /** Reading passage layout — ẩn đoạn văn lặp trong từng câu MCQ */
  hidePassage?: boolean;
}

export function QuestionRenderer({
  question,
  index,
  value,
  onChange,
  onSpeakingTranscript,
  disabled,
  isListening = false,
  maxSpeakingWords,
  objectiveFeedback = null,
  lockObjectiveAnswer = false,
  practiceMinWords = null,
  hidePassage = false,
}: QuestionRendererProps) {
  const content = question.content as McqContent | GapFillContent | FreeTextContent | SpeakingContent;
  const mcqContent = content as McqContent;
  const audioSrc = question.audioUrl;
  const transcript = mcqContent.transcript
    ? isListening
      ? normalizeListeningTranscript(mcqContent.transcript)
      : mcqContent.transcript
    : undefined;
  const media =
    question.type === "MCQ"
      ? resolveMcqMedia({
          question: mcqContent.question,
          passage: mcqContent.passage,
          transcript: mcqContent.transcript,
          imageDescription: mcqContent.imageDescription,
          imageUrl: mcqContent.imageUrl,
          sceneEmoji: mcqContent.sceneEmoji,
          questionType: mcqContent.questionType,
        })
      : null;
  const displayQuestion = isListening
    ? stripListeningScriptFromQuestion(media?.question ?? mcqContent.question ?? "")
    : (media?.question ?? mcqContent.question);

  return (
    <div
      className={cn(
        "space-y-4 rounded-3xl border-2 border-purple-200 bg-white/95 p-6 shadow-lg",
        hidePassage && "space-y-3 rounded-xl border-purple-100 p-3 shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            "font-bold text-purple-800",
            hidePassage ? "text-sm" : "text-base"
          )}
        >
          Câu {index + 1}
        </h3>
      </div>

      {media && (media.imageDescription || media.imageUrl) && (
        <QuestionIllustration
          imageUrl={media.imageUrl}
          imageDescription={media.imageDescription}
          sceneEmoji={media.sceneEmoji}
        />
      )}

      {(question.type !== "SPEAKING_PROMPT" &&
        (isListening || audioSrc || transcript)) && (
        <AudioPlayer
          key={question.id}
          questionId={question.id}
          src={audioSrc}
          transcript={transcript}
          title="Nghe audio"
          autoPlay={isListening}
          isListening={isListening}
        />
      )}

      {question.type === "MCQ" && (
        <McqQuestion
          content={{ ...mcqContent, question: displayQuestion }}
          value={value as string}
          onChange={onChange}
          disabled={disabled || lockObjectiveAnswer}
          hidePassage={hidePassage}
        />
      )}

      {question.type === "GAP_FILL" && (
        <GapFillQuestion
          content={content as GapFillContent}
          value={value as string[]}
          onChange={onChange}
          disabled={disabled || lockObjectiveAnswer}
        />
      )}

      {question.type === "FREE_TEXT" && (
        <FreeTextQuestion
          content={content as FreeTextContent}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
          practiceMinWords={practiceMinWords}
        />
      )}

      {question.type === "SPEAKING_PROMPT" && (
        <SpeakingQuestion
          questionId={question.id}
          audioUrl={audioSrc}
          content={content as SpeakingContent}
          questionTitle={question.title}
          savedTranscript={typeof value === "string" ? value : ""}
          onSpeakingTranscript={onSpeakingTranscript}
          disabled={disabled}
          maxWords={maxSpeakingWords}
          practiceMinWords={practiceMinWords}
        />
      )}

      {objectiveFeedback && (
        <PracticeObjectiveFeedback
          feedback={objectiveFeedback}
          questionType={question.type}
          content={question.content}
          studentAnswer={value}
          correctAnswer={question.correctAnswer}
        />
      )}
    </div>
  );
}

const MCQ_COLORS = [
  "border-blue-300 hover:bg-blue-50 data-[selected=true]:bg-blue-100 data-[selected=true]:border-blue-500",
  "border-purple-300 hover:bg-purple-50 data-[selected=true]:bg-purple-100 data-[selected=true]:border-purple-500",
  "border-emerald-300 hover:bg-emerald-50 data-[selected=true]:bg-emerald-100 data-[selected=true]:border-emerald-500",
  "border-orange-300 hover:bg-orange-50 data-[selected=true]:bg-orange-100 data-[selected=true]:border-orange-500",
];

const MCQ_LABELS = ["A", "B", "C", "D"];

function McqQuestion({
  content,
  value,
  onChange,
  disabled,
  hidePassage = false,
}: {
  content: McqContent;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hidePassage?: boolean;
}) {
  return (
    <div className="space-y-4">
      {content.passage && !hidePassage && (
        <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-4 text-base font-medium leading-relaxed whitespace-pre-wrap md:text-lg">
          📄 {content.passage}
        </div>
      )}
      <p
        className={cn(
          "font-bold leading-snug text-purple-900",
          hidePassage ? "text-lg md:text-xl" : "text-xl md:text-2xl"
        )}
      >
        {content.question}
      </p>
      <div className={cn("space-y-2", !hidePassage && "space-y-2.5")}>
        {content.options.map((opt, i) => (
          <label
            key={i}
            data-selected={value === opt}
            className={cn(
              "mcq-option-kid border-2",
              MCQ_COLORS[i % MCQ_COLORS.length],
              value === opt && "shadow-sm ring-2 ring-purple-300",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-[11px] font-extrabold text-white shadow-sm">
              {MCQ_LABELS[i]}
            </span>
            <input
              type="radio"
              name="mcq"
              checked={value === opt}
              onChange={() => onChange(opt)}
              disabled={disabled}
              className="sr-only"
            />
            <span className="text-sm font-medium leading-snug">{opt}</span>
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
      <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-base font-medium leading-relaxed whitespace-pre-wrap md:text-lg">
        {content.passage}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: content.blanks }).map((_, i) => (
          <div key={i}>
            <Label className="text-xs font-bold text-purple-700">Chỗ trống {i + 1}</Label>
            <input
              className="mt-1 flex h-9 w-full rounded-lg border-2 border-purple-200 px-3 text-sm font-medium focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
  practiceMinWords,
}: {
  content: FreeTextContent;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  practiceMinWords?: number | null;
}) {
  const wordCount = (value ?? "").trim().split(/\s+/).filter(Boolean).length;
  const submissionLimit = getWritingSubmissionWordLimit(content.wordLimit);
  const overLimit = submissionLimit ? wordCount > submissionLimit : false;
  const limitHint = formatWritingWordLimitHint(content.wordLimit);

  const handleChange = (text: string) => {
    if (submissionLimit) {
      const words = text.trim().split(/\s+/).filter(Boolean);
      if (words.length > submissionLimit) {
        onChange(words.slice(0, submissionLimit).join(" "));
        return;
      }
    }
    onChange(text);
  };

  return (
    <div className="space-y-4">
      {content.instructions && (
        <p className="text-sm text-muted-foreground">{content.instructions}</p>
      )}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <p className="text-base font-bold leading-relaxed text-amber-900 whitespace-pre-wrap md:text-lg">
          ✏️ {content.taskPrompt}
        </p>
      </div>
      <Textarea
        rows={10}
        placeholder="Viết câu trả lời bằng tiếng Anh nhé..."
        className="rounded-2xl border-2 border-purple-200 text-base"
        value={value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
      />
      <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
        <span className={overLimit ? "font-bold text-red-600" : ""}>{wordCount} từ</span>
        <div className="flex flex-col items-end gap-0.5">
          {practiceMinWords != null && (
            <span
              className={
                wordCount >= practiceMinWords
                  ? "font-semibold text-emerald-700"
                  : "font-semibold text-amber-800"
              }
            >
              Tối thiểu {practiceMinWords} từ
            </span>
          )}
          {limitHint && <span>{limitHint}</span>}
        </div>
      </div>
    </div>
  );
}

function SpeakingQuestion({
  questionId,
  audioUrl,
  content,
  questionTitle,
  savedTranscript = "",
  onSpeakingTranscript,
  disabled,
  maxWords,
  practiceMinWords,
}: {
  questionId: string;
  audioUrl?: string | null;
  content: SpeakingContent;
  questionTitle?: string | null;
  savedTranscript?: string;
  onSpeakingTranscript?: (text: string) => void;
  disabled?: boolean;
  maxWords?: number;
  practiceMinWords?: number | null;
}) {
  const [showPrompt, setShowPrompt] = useState(false);
  const promptText = getSpeakingPromptText(content);
  const wordCount = savedTranscript.trim().split(/\s+/).filter(Boolean).length;
  const meetsMin =
    practiceMinWords != null &&
    wordCount >= practiceMinWords &&
    savedTranscript.trim().length >= 3;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/90 via-white to-pink-50/40 shadow-sm">
        <div className="border-b border-purple-100 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-sm font-extrabold text-purple-900">🎤 Bài nói</p>
            <div className="flex flex-wrap gap-1.5">
              {content.preparationTime != null && content.preparationTime > 0 && (
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-base font-bold text-purple-700 ring-1 ring-purple-100">
                  Chuẩn bị {content.preparationTime}s
                </span>
              )}
              {content.speakingTime != null && content.speakingTime > 0 && (
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-base font-bold text-purple-700 ring-1 ring-purple-100">
                  Nói {content.speakingTime}s
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 py-3">
          <AudioPlayer
            questionId={questionId}
            src={audioUrl}
            transcript={promptText}
            autoPlay
            isSpeakingPrompt
            embedded
          />

          {promptText && (
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-purple-200 text-base font-bold text-purple-800"
                onClick={() => setShowPrompt((v) => !v)}
              >
                {showPrompt ? (
                  <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                )}
                {showPrompt ? "Ẩn nội dung câu hỏi" : "Hiện nội dung câu hỏi"}
              </Button>
              {showPrompt && (
                <div className="mt-2 rounded-xl border border-sky-200/80 bg-sky-50/60 px-3 py-2.5 text-sm font-medium leading-relaxed text-sky-950 whitespace-pre-wrap">
                  {promptText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {savedTranscript.trim().length >= 3 && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          ✅ Đã lưu bài nói ({wordCount} từ)
        </p>
      )}

      {maxWords != null && maxWords <= 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50 p-6 text-center">
          <p className="font-bold text-purple-900">🔒 Speaking chỉ có ở gói Pro trở lên</p>
          <p className="mt-2 text-sm text-purple-700">
            Nâng cấp để luyện nói với AI chấm sửa mỗi ngày.
          </p>
          <Button asChild className="mt-4 kid-btn-fun rounded-full">
            <Link href="/pricing">Xem bảng giá</Link>
          </Button>
        </div>
      ) : (
        <AudioRecorder
          onTranscript={(text) => onSpeakingTranscript?.(text)}
          disabled={disabled}
          hideLiveTranscript
          maxWords={maxWords}
          minWordsHint={
            practiceMinWords != null
              ? { min: practiceMinWords, meetsMin }
              : undefined
          }
        />
      )}
    </div>
  );
}
