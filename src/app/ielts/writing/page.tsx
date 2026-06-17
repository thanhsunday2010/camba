import { redirect } from "next/navigation";
import { IELTS_ACADEMIC_WRITING_URL } from "@/lib/exam/ielts-module";

export default function IeltsWritingRedirectPage() {
  redirect(IELTS_ACADEMIC_WRITING_URL);
}
