import { z } from "zod";
import { VTEN_COURSE_LABEL, VTEN_COURSE_URL } from "@/lib/site/vten-course";

export const footerLinkSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(500),
});

export const footerColumnSchema = z.object({
  title: z.string().min(1).max(80),
  links: z.array(footerLinkSchema).max(12),
});

export const footerSettingsSchema = z.object({
  brandDescription: z.string().max(500),
  columns: z.array(footerColumnSchema).min(1).max(6),
  contactEmail: z.string().max(120).optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  copyright: z.string().min(1).max(200),
});

export type FooterLink = z.infer<typeof footerLinkSchema>;
export type FooterColumn = z.infer<typeof footerColumnSchema>;
export type FooterSettings = z.infer<typeof footerSettingsSchema>;

export const FOOTER_SETTING_KEY = "footer";

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  brandDescription:
    "Luyện thi Cambridge K12 với AI chấm Writing & Speaking — vui, dễ hiểu, phù hợp học sinh Việt Nam.",
  columns: [
    {
      title: "Luyện tập",
      links: [
        { label: "Chọn level", href: "/exams" },
        { label: "Test trình độ", href: "/placement" },
        { label: "Bảng giá", href: "/pricing" },
      ],
    },
    {
      title: "Tài khoản",
      links: [
        { label: "Đăng ký miễn phí", href: "/register" },
        { label: "Đăng nhập", href: "/login" },
        { label: "Trang của tôi", href: "/dashboard" },
        { label: VTEN_COURSE_LABEL, href: VTEN_COURSE_URL },
      ],
    },
    {
      title: "Camba",
      links: [
        { label: "Trang chủ", href: "/" },
        { label: "Gói Pro & VIP", href: "/pricing" },
      ],
    },
  ],
  contactEmail: "hello@camba.vn",
  contactPhone: "",
  address: "",
  copyright: "© {year} Camba. All rights reserved.",
};

export function renderCopyright(template: string): string {
  return template.replace("{year}", String(new Date().getFullYear()));
}

/** Cột 2 footer luôn có link VTEN — kể cả khi admin đã lưu cấu hình cũ. */
export function ensureVtenCourseFooterLink(settings: FooterSettings): FooterSettings {
  if (settings.columns.length < 2) return settings;

  const columns = settings.columns.map((column, index) => {
    if (index !== 1) return column;
    const hasLink = column.links.some((link) => link.href === VTEN_COURSE_URL);
    if (hasLink) return column;
    return {
      ...column,
      links: [...column.links, { label: VTEN_COURSE_LABEL, href: VTEN_COURSE_URL }],
    };
  });

  return { ...settings, columns };
}

export function isExternalFooterHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
