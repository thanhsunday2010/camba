import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  ALLOWED_QUESTION_IMAGE_TYPES,
  MAX_QUESTION_IMAGE_BYTES,
} from "./question-image-constants";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/$/, ""), serviceKey };
}

function extensionFor(file: File): string {
  return EXT_BY_TYPE[file.type] ?? "jpg";
}

function uniqueSuffix(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function validateQuestionImageFile(file: File): string | null {
  if (!file.size) return "Chọn file ảnh";
  if (file.size > MAX_QUESTION_IMAGE_BYTES) return "Ảnh tối đa 1MB";
  if (!ALLOWED_QUESTION_IMAGE_TYPES.has(file.type)) {
    return "Chỉ hỗ trợ JPG, PNG, WEBP";
  }
  return null;
}

async function uploadToSupabase(
  buffer: Buffer,
  objectPath: string,
  contentType: string
): Promise<string> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Chưa cấu hình SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY để upload ảnh trên production"
    );
  }

  const bucket = process.env.SUPABASE_QUESTION_IMAGES_BUCKET?.trim() || "question-images";
  const uploadUrl = `${config.url}/storage/v1/object/${bucket}/${objectPath}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      apikey: config.serviceKey,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Upload Supabase thất bại (${res.status}): ${detail.slice(0, 200)}`);
  }

  return `${config.url}/storage/v1/object/public/${bucket}/${objectPath}`;
}

async function uploadToLocalPublic(
  buffer: Buffer,
  objectPath: string
): Promise<string> {
  const dest = path.join(process.cwd(), "public", objectPath);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buffer);
  return `/${objectPath.replace(/\\/g, "/")}`;
}

export async function uploadQuestionImageFile(
  questionId: string,
  file: File
): Promise<string> {
  const validationError = validateQuestionImageFile(file);
  if (validationError) throw new Error(validationError);

  const ext = extensionFor(file);
  const objectPath = `uploads/questions/${questionId}-${uniqueSuffix()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (getSupabaseConfig()) {
    return uploadToSupabase(buffer, objectPath, file.type);
  }

  return uploadToLocalPublic(buffer, objectPath);
}
