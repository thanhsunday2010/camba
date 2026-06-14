export type LoadingPhrase = {
  en: string;
  vi: string;
};

export const LOADING_PHRASES: LoadingPhrase[] = [
  { en: "Hello!", vi: "Xin chào!" },
  { en: "Ready!", vi: "Sẵn sàng!" },
  { en: "Keep going!", vi: "Tiếp tục nhé!" },
  { en: "Great job!", vi: "Giỏi lắm!" },
  { en: "Let's learn!", vi: "Cùng học nào!" },
  { en: "Almost there!", vi: "Sắp xong rồi!" },
  { en: "You can do it!", vi: "Bạn làm được!" },
  { en: "Well done!", vi: "Làm tốt lắm!" },
  { en: "Good luck!", vi: "Chúc may mắn!" },
  { en: "Stay curious!", vi: "Giữ sự tò mò nhé!" },
  { en: "Level up!", vi: "Lên cấp thôi!" },
  { en: "Think smart!", vi: "Suy nghĩ thông minh!" },
  { en: "Awesome!", vi: "Tuyệt vời!" },
  { en: "Focus!", vi: "Tập trung nào!" },
  { en: "One more step!", vi: "Thêm một bước nữa!" },
  { en: "Reading", vi: "Đọc hiểu" },
  { en: "Writing", vi: "Viết" },
  { en: "Listening", vi: "Nghe" },
  { en: "Speaking", vi: "Nói" },
  { en: "Use of English", vi: "Ngữ pháp & từ vựng" },
  { en: "Practice makes perfect", vi: "Luyện tập thành công" },
  { en: "Starters", vi: "Cấp Starters" },
  { en: "Movers", vi: "Cấp Movers" },
  { en: "Flyers", vi: "Cấp Flyers" },
  { en: "KET", vi: "Chứng chỉ A2" },
  { en: "PET", vi: "Chứng chỉ B1" },
  { en: "FCE", vi: "Chứng chỉ B2" },
  { en: "Cambridge", vi: "Cambridge" },
  { en: "Smart bunny!", vi: "Thỏ thông minh!" },
  { en: "Hop hop!", vi: "Nhảy nhót nào!" },
  { en: "Patience", vi: "Kiên nhẫn chút nhé" },
  { en: "Try again!", vi: "Thử lại nhé!" },
  { en: "Smile!", vi: "Cười lên nào!" },
  { en: "Brilliant!", vi: "Xuất sắc!" },
  { en: "Keep trying!", vi: "Cố lên nhé!" },
];

export function pickLoadingPhrase(): LoadingPhrase {
  return LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]!;
}
