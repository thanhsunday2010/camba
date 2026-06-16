/** Client-safe constants for question image uploads */
export const MAX_QUESTION_IMAGE_BYTES = 1024 * 1024; // 1 MB

export const ALLOWED_QUESTION_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_QUESTION_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
