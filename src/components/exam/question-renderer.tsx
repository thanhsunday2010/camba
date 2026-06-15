"use client";

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
import { cn } from "@/lib/utils";

interface QuestionData {
  id: string;
  type: QuestionType;
  content: unknown;
  audioUrl?: string | null;
  points: number;
  title?: string | null;
}

interface QuestionRendererProps {
  question: QuestionData;
  index: number;
  value: unknown;
  onChange: (value: unknown) => void;
  onSpeakingTranscript?: (text: string) => void;
  disabled?: boolean;
  isListening?: boolean;
  /** Hide speaking prompt/script from students during the test */
  hideSpeakingScript?: boolean;
  maxWritingWords?: number;
  maxSpeakingWords?: number;
}

export function QuestionRenderer({
  question,
  index,
  value,
  onChange,
  onSpeakingTranscript,
  disabled,
  isListening = false,
  hideSpeakingScript = true,
  maxWritingWords,
  maxSpeakingWords,
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
    <div className="space-y-4 rounded-3xl border-2 border-purple-200 bg-white/95 p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-extrabold text-purple-800">
          ✨ Câu {index + 1}
        </h3>
        <span className="rounded-full bg-sunshine-200 px-3 py-1 text-xs font-bold text-sunshine-900">
          ⭐ {question.points} điểm
        </span>
      </div>

      {media && (media.imageDescription || media.imageUrl) && (
        <QuestionIllustration
          imageUrl={media.imageUrl}
          imageDescription={media.imageDescription}
          sceneEmoji={media.sceneEmoji}
        />
      )}

      {(isListening || audioSrc || transcript) && (
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
          maxWords={maxWritingWords}
        />
      )}

      {question.type === "SPEAKING_PROMPT" && (
        <SpeakingQuestion
          content={content as SpeakingContent}
          questionTitle={question.title}
          hideScript={hideSpeakingScript}
          savedTranscript={typeof value === "string" ? value : ""}
          onSpeakingTranscript={onSpeakingTranscript}
          disabled={disabled}
          maxWords={maxSpeakingWords}
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
}: {
  content: McqContent;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      {content.passage && (
        <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap">
          📄 {content.passage}
        </div>
      )}
      <p className="text-lg font-bold text-purple-900">{content.question}</p>
      <div className="space-y-3">
        {content.options.map((opt, i) => (
          <label
            key={i}
            data-selected={value === opt}
            className={cn(
              "mcq-option-kid border-2",
              MCQ_COLORS[i % MCQ_COLORS.length],
              value === opt && "scale-[1.02] shadow-md ring-2 ring-purple-300",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-sm font-extrabold text-white shadow-sm">
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
            <span className="font-semibold">{opt}</span>
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
      <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap">
        {content.passage}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: content.blanks }).map((_, i) => (
          <div key={i}>
            <Label className="font-bold text-purple-700">Chỗ trống {i + 1}</Label>
            <input
              className="mt-1 flex h-12 w-full rounded-xl border-2 border-purple-200 px-4 text-sm font-semibold focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
  maxWords,
}: {
  content: FreeTextContent;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  maxWords?: number;
}) {
  const wordCount = (value ?? "").trim().split(/\s+/).filter(Boolean).length;
  const planLimit = maxWords ?? content.wordLimit;
  const overLimit = planLimit ? wordCount > planLimit : false;

  const handleChange = (text: string) => {
    if (planLimit) {
      const words = text.trim().split(/\s+/).filter(Boolean);
      if (words.length > planLimit) {
        onChange(words.slice(0, planLimit).join(" "));
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
        <p className="font-bold text-amber-900 whitespace-pre-wrap">✏️ {content.taskPrompt}</p>
      </div>
      <Textarea
        rows={10}
        placeholder="Viết câu trả lời bằng tiếng Anh nhé..."
        className="rounded-2xl border-2 border-purple-200 text-base"
        value={value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span className={overLimit ? "font-bold text-red-600" : ""}>{wordCount} từ</span>
        {planLimit && (
          <span>
            Giới hạn gói: {planLimit} từ/lần
            {content.wordLimit && content.wordLimit !== planLimit && (
              <span className="ml-1">(đề: {content.wordLimit} từ)</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function SpeakingQuestion({
  content,
  questionTitle,
  hideScript = true,
  savedTranscript = "",
  onSpeakingTranscript,
  disabled,
  maxWords,
}: {
  content: SpeakingContent;
  questionTitle?: string | null;
  hideScript?: boolean;
  savedTranscript?: string;
  onSpeakingTranscript?: (text: string) => void;
  disabled?: boolean;
  maxWords?: number;
}) {
  const scriptText = content.script?.trim() || content.prompt?.trim() || "";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <p className="font-bold text-purple-900">🎤 Bài nói</p>
        {questionTitle && (
          <p className="mt-1 text-sm font-semibold text-purple-800">{questionTitle}</p>
        )}
        {hideScript ? (
          <p className="mt-2 text-sm text-purple-700">
            Nhấn nút mic và trả lời bằng tiếng Anh. Nội dung câu hỏi không hiển thị — giống thi
            Speaking thật.
          </p>
        ) : (
          scriptText && (
            <p className="mt-2 font-bold whitespace-pre-wrap text-purple-900">{scriptText}</p>
          )
        )}
        {(content.preparationTime || content.speakingTime) && (
          <p className="mt-2 text-sm text-purple-700">
            {content.preparationTime && `Chuẩn bị: ${content.preparationTime}s`}
            {content.speakingTime && ` | Nói: ${content.speakingTime}s`}
          </p>
        )}
      </div>
      {savedTranscript.trim().length >= 3 && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          ✅ Đã lưu bài nói ({savedTranscript.trim().split(/\s+/).filter(Boolean).length} từ)
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
          hideLiveTranscript={hideScript}
          maxWords={maxWords}
        />
      )}
    </div>
  );
}
