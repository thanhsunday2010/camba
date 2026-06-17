import { redirect } from "next/navigation";
import { IELTS_ACADEMIC_SPEAKING_URL } from "@/lib/exam/ielts-module";

export default function IeltsSpeakingRedirectPage() {
  redirect(IELTS_ACADEMIC_SPEAKING_URL);
}
