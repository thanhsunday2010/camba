"use client";

interface AudioPlayerProps {
  src: string;
  title?: string;
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  return (
    <div className="rounded-lg border bg-cambridge-50 p-4">
      {title && <p className="mb-2 text-sm font-medium text-cambridge-800">{title}</p>}
      <audio controls className="w-full" src={src}>
        Trình duyệt không hỗ trợ audio.
      </audio>
    </div>
  );
}
