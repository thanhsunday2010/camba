export type KidSound =
  | "click"
  | "pop"
  | "success"
  | "celebrate"
  | "whoosh"
  | "star"
  | "answerCorrect"
  | "answerWrong";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.15
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

export function playKidSound(sound: KidSound) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const t = ctx.currentTime;

  switch (sound) {
    case "click":
      tone(ctx, 520, t, 0.06, "sine", 0.12);
      break;
    case "pop":
      tone(ctx, 680, t, 0.08, "triangle", 0.14);
      tone(ctx, 880, t + 0.04, 0.06, "triangle", 0.1);
      break;
    case "whoosh":
      tone(ctx, 400, t, 0.1, "sine", 0.08);
      tone(ctx, 600, t + 0.05, 0.1, "sine", 0.06);
      break;
    case "success":
      tone(ctx, 523, t, 0.12, "sine", 0.13);
      tone(ctx, 659, t + 0.1, 0.12, "sine", 0.13);
      tone(ctx, 784, t + 0.2, 0.18, "sine", 0.14);
      break;
    case "star":
      tone(ctx, 880, t, 0.08, "triangle", 0.1);
      tone(ctx, 1100, t + 0.06, 0.12, "triangle", 0.12);
      break;
    case "celebrate":
      [523, 659, 784, 1047].forEach((f, i) => {
        tone(ctx, f, t + i * 0.09, 0.15, "sine", 0.12);
      });
      break;
    case "answerCorrect":
      [523, 659, 784, 988, 1175].forEach((f, i) => {
        tone(ctx, f, t + i * 0.06, 0.14, "triangle", 0.14);
      });
      tone(ctx, 1568, t + 0.35, 0.2, "sine", 0.12);
      break;
    case "answerWrong":
      tone(ctx, 220, t, 0.12, "sawtooth", 0.1);
      tone(ctx, 165, t + 0.1, 0.15, "sawtooth", 0.08);
      tone(ctx, 110, t + 0.22, 0.28, "square", 0.06);
      break;
  }
}
