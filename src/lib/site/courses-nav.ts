import { EXAM_LEVELS } from "@/lib/constants";
import { CAMBRIDGE_COURSES_URL, IELTS_SPEAKING_URL } from "@/lib/site/ielts-speaking-cta";

export type CourseNavLink = {
  label: string;
  href: string;
  description?: string;
};

export type CourseNavGroup = {
  id: string;
  label: string;
  href?: string;
  children: CourseNavLink[];
};

export const COURSES_NAV: CourseNavGroup[] = [
  {
    id: "ielts-speaking",
    label: "Luyện thi Speaking IELTS",
    href: IELTS_SPEAKING_URL,
    children: [{ label: "Speaking IELTS — Luyện & Mock", href: IELTS_SPEAKING_URL }],
  },
  {
    id: "ielts-writing",
    label: "Luyện thi Writing IELTS",
    href: "/ielts/writing",
    children: [{ label: "Writing IELTS — Luyện & Mock", href: "/ielts/writing" }],
  },
  {
    id: "cambridge",
    label: "Luyện thi Cambridge",
    href: CAMBRIDGE_COURSES_URL,
    children: EXAM_LEVELS.map((level) => ({
      label: level.label,
      href: `/exams/${level.value}`,
    })),
  },
  {
    id: "dgnl",
    label: "Luyện thi ĐGNL",
    href: "/placement",
    children: [
      {
        label: "V-ACT",
        href: "/placement",
        description: "Test trình độ — sắp có đề chuyên sâu",
      },
      {
        label: "HSA",
        href: "/placement",
        description: "Test trình độ — sắp có đề chuyên sâu",
      },
      {
        label: "TSA",
        href: "/placement",
        description: "Test trình độ — sắp có đề chuyên sâu",
      },
    ],
  },
];
