import { EXAM_LEVELS } from "@/lib/constants";
import {
  CAMBRIDGE_COURSES_URL,
  IELTS_SPEAKING_URL,
  IELTS_WRITING_URL,
} from "@/lib/site/ielts-speaking-cta";

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
    id: "ielts-academic",
    label: "IELTS Academic",
    href: IELTS_SPEAKING_URL,
    children: [
      { label: "Speaking Academic — Luyện & Mock", href: IELTS_SPEAKING_URL },
      { label: "Writing Academic — Luyện & Mock", href: IELTS_WRITING_URL },
    ],
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
