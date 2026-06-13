"use client";

const SHAPES = [
  { emoji: "⭐", top: "8%", left: "4%", delay: "0s", size: "text-2xl" },
  { emoji: "🌈", top: "15%", right: "6%", delay: "1s", size: "text-3xl" },
  { emoji: "🎈", top: "45%", left: "2%", delay: "2s", size: "text-2xl" },
  { emoji: "✨", top: "60%", right: "3%", delay: "0.5s", size: "text-xl" },
  { emoji: "🎯", bottom: "20%", left: "5%", delay: "1.5s", size: "text-2xl" },
  { emoji: "📚", bottom: "12%", right: "8%", delay: "2.5s", size: "text-2xl" },
];

export function FloatingDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40"
      aria-hidden
    >
      {SHAPES.map((s, i) => (
        <span
          key={i}
          className={`absolute animate-float ${s.size}`}
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            animationDelay: s.delay,
          }}
        >
          {s.emoji}
        </span>
      ))}
      <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl" />
    </div>
  );
}
