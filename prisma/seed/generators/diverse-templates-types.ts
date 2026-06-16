import type { SeedDifficulty } from "../../../src/lib/exam/question-diversity";
import type { GapSeed, ListeningSeed, McqSeed, SpeakingSeed, WritingSeed } from "../helpers";
import type { VarContext } from "./seed-vars";

export type McqBuilder = (v: VarContext, tag: string) => McqSeed;
export type GapBuilder = (v: VarContext, tag: string) => GapSeed;
export type ListenBuilder = (v: VarContext, tag: string) => ListeningSeed;
export type WriteBuilder = (v: VarContext, tag: string) => WritingSeed;
export type SpeakBuilder = (v: VarContext, tag: string) => SpeakingSeed;

export type { SeedDifficulty };
