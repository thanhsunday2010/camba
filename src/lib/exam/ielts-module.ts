export type IeltsModule = "ACADEMIC" | "GENERAL";

export const IELTS_MODULE_DEFAULT: IeltsModule = "ACADEMIC";

export const IELTS_MODULES: IeltsModule[] = ["ACADEMIC", "GENERAL"];

export const IELTS_MODULE_META: Record<
  IeltsModule,
  {
    shortLabel: string;
    label: string;
    hubTitle: (skill: "Speaking" | "Writing") => string;
    description: string;
    badgeClassName: string;
    available: boolean;
  }
> = {
  ACADEMIC: {
    shortLabel: "Academic",
    label: "IELTS Academic",
    hubTitle: (skill) => `Luyện thi ${skill} IELTS Academic`,
    description: "Dành cho du học, đại học và môi trường học thuật",
    badgeClassName: "border-indigo-200 bg-indigo-100 text-indigo-900",
    available: true,
  },
  GENERAL: {
    shortLabel: "General Training",
    label: "IELTS General Training",
    hubTitle: (skill) => `Luyện thi ${skill} IELTS General Training`,
    description: "Dành cho định cư, làm việc và visa — đang phát triển",
    badgeClassName: "border-teal-200 bg-teal-100 text-teal-900",
    available: false,
  },
};

export function ieltsModuleCode(module: IeltsModule): "AC" | "GT" {
  return module === "ACADEMIC" ? "AC" : "GT";
}

export function parseIeltsModuleCode(code: string): IeltsModule | null {
  if (code === "AC") return "ACADEMIC";
  if (code === "GT") return "GENERAL";
  return null;
}

export function parseIeltsModuleFromPoolKey(
  key: string | null | undefined
): IeltsModule | null {
  if (!key) return null;
  const tagged = key.match(/^IELTS:(AC|GT):/);
  if (tagged) return parseIeltsModuleCode(tagged[1]!);
  if (/^IELTS:(SPK|WRT):/.test(key)) return "ACADEMIC";
  return null;
}

export function isIeltsPoolKey(key: string): boolean {
  return /^IELTS:(AC|GT):(SPK|WRT):/.test(key) || /^IELTS:(SPK|WRT):/.test(key);
}

/** Academic pool: explicit ACADEMIC hoặc câu cũ chưa gắn module (legacy). */
export function ieltsAcademicQuestionFilter() {
  return {
    NOT: { content: { path: ["ieltsModule"], equals: "GENERAL" } },
  } as const;
}

export function ieltsModuleContentFilter(module: IeltsModule) {
  return { content: { path: ["ieltsModule"], equals: module } } as const;
}

export function ieltsModuleQuestionFilter(module: IeltsModule) {
  if (module === "ACADEMIC") return ieltsAcademicQuestionFilter();
  return ieltsModuleContentFilter(module);
}

export function ieltsHubPath(
  skill: "speaking" | "writing",
  module: IeltsModule = IELTS_MODULE_DEFAULT
): string {
  const slug = module === "ACADEMIC" ? "academic" : "general";
  return `/ielts/${slug}/${skill}`;
}

export const IELTS_ACADEMIC_SPEAKING_URL = ieltsHubPath("speaking", "ACADEMIC");
export const IELTS_ACADEMIC_WRITING_URL = ieltsHubPath("writing", "ACADEMIC");
