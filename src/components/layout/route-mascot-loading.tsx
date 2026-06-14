"use client";

import { useEffect, useState } from "react";
import { CambaMascot } from "@/components/kids/camba-mascot";
import {
  LOADING_PHRASES,
  pickLoadingPhrase,
  type LoadingPhrase,
} from "@/lib/kids/loading-phrases";

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 align-middle" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export function RouteMascotLoading() {
  const [phrase, setPhrase] = useState<LoadingPhrase>(LOADING_PHRASES[0]!);

  useEffect(() => {
    setPhrase(pickLoadingPhrase());
    const timer = window.setInterval(() => setPhrase(pickLoadingPhrase()), 3500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CambaMascot size="lg" mood="think" />
      <p className="mt-6 text-xl font-extrabold text-purple-800 md:text-2xl">
        Chờ mình chút nhé! <LoadingDots />
      </p>
      <p
        key={`${phrase.en}-${phrase.vi}`}
        className="mt-3 max-w-md animate-bounce-in text-lg font-bold text-purple-600 md:text-xl"
      >
        {phrase.en}
        <span className="mt-1 block text-base font-semibold text-muted-foreground md:text-lg">
          {phrase.vi}
        </span>
      </p>
      <p className="sr-only">Đang tải trang, vui lòng đợi trong giây lát.</p>
    </div>
  );
}

export default function RouteLoading() {
  return <RouteMascotLoading />;
}
