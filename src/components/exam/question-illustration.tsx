import Image from "next/image";
import { pickSceneEmoji } from "@/lib/exam/question-media";

interface QuestionIllustrationProps {
  imageUrl?: string;
  imageDescription?: string;
  sceneEmoji?: string;
  title?: string;
}

export function QuestionIllustration({
  imageUrl,
  imageDescription,
  sceneEmoji,
  title = "Hình minh họa",
}: QuestionIllustrationProps) {
  if (!imageUrl && !imageDescription) return null;

  const emoji = sceneEmoji ?? pickSceneEmoji(imageDescription ?? "");

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-md">
      <div className="border-b border-sky-200 bg-sky-100/80 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-sky-800">
        🎨 {title}
      </div>

      {imageUrl ? (
        <div className="relative aspect-[4/3] w-full bg-white">
          <Image
            src={imageUrl}
            alt={imageDescription ?? "Question illustration"}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 100vw, 640px"
            unoptimized={imageUrl.startsWith("http")}
          />
        </div>
      ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 px-6 py-8 text-center">
          <span className="text-7xl drop-shadow-sm" role="img" aria-hidden>
            {emoji}
          </span>
          <p className="max-w-md text-sm font-semibold leading-relaxed text-sky-900">
            {imageDescription}
          </p>
        </div>
      )}
    </div>
  );
}
