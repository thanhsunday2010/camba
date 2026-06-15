"use client";

import { useRef, useState } from "react";
import { Mic, Square, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AudioRecorderProps {
  /** Called with transcript from Web Speech API or manual input */
  onTranscript: (text: string) => void;
  disabled?: boolean;
  /** Hide live transcript while recording (speaking test mode) */
  hideTranscript?: boolean;
  maxWords?: number;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function speechErrorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Trình duyệt chưa được phép dùng micro. Bấm biểu tượng 🔒 trên thanh địa chỉ → cho phép Microphone.";
    case "no-speech":
      return "Không nghe thấy giọng nói. Hãy nói to hơn hoặc kiểm tra micro.";
    case "audio-capture":
      return "Không truy cập được micro. Kiểm tra thiết bị hoặc thử Chrome/Edge.";
    case "network":
      return "Lỗi mạng khi nhận dạng giọng nói. Thử lại hoặc nhập transcript thủ công.";
    default:
      return "Không thể ghi âm. Dùng Chrome/Edge trên HTTPS hoặc nhập transcript bên dưới.";
  }
}

async function requestMicrophoneAccess(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export function AudioRecorder({
  onTranscript,
  disabled,
  hideTranscript = false,
  maxWords,
}: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const recordingRef = useRef(false);

  const checkSupport = () => {
    const supported = !!getSpeechRecognition();
    setSpeechSupported(supported);
    return supported;
  };

  const collectTranscript = () =>
    (finalTranscriptRef.current + " " + interimTranscriptRef.current).trim();

  const submitTranscript = (raw: string) => {
    const text = raw.trim();
    if (text.length < 3) {
      toast.error("Nói hoặc nhập ít nhất vài từ tiếng Anh nhé.");
      setShowManualFallback(true);
      return;
    }
    onTranscript(maxWords ? trimToWordLimit(text, maxWords) : text);
  };

  const stopRecording = () => {
    recordingRef.current = false;
    recognitionRef.current?.stop();
    setRecording(false);

    window.setTimeout(() => {
      submitTranscript(collectTranscript());
    }, 350);
  };

  const startRecognition = () => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setLiveTranscript("");

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalText;
      interimTranscriptRef.current = interim;
      setLiveTranscript((finalText + interim).trim());
    };

    recognition.onerror = (event) => {
      recordingRef.current = false;
      setRecording(false);
      recognitionRef.current = null;
      setSpeechSupported(false);
      setShowManualFallback(true);
      toast.error(speechErrorMessage(event.error));
    };

    recognition.onend = () => {
      if (recordingRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through */
        }
      }
      setRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startRecording = async () => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setSpeechSupported(false);
      setShowManualFallback(true);
      toast.error("Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome/Edge.");
      return;
    }

    const micOk = await requestMicrophoneAccess();
    if (!micOk) {
      setSpeechSupported(false);
      setShowManualFallback(true);
      toast.error(speechErrorMessage("not-allowed"));
      return;
    }

    setSpeechSupported(true);
    recordingRef.current = true;
    setRecording(true);
    startRecognition();
  };

  const submitManual = () => {
    submitTranscript(manualText);
  };

  const manualWordCount = countWords(manualText);
  const showManual = !hideTranscript || showManualFallback || speechSupported === false;

  return (
    <div className="space-y-4">
      {speechSupported === false && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Trình duyệt không hỗ trợ Web Speech API hoặc micro bị chặn. Dùng Chrome/Edge trên
            HTTPS, cho phép micro, hoặc nhập transcript thủ công bên dưới.
          </p>
        </div>
      )}

      <div className="rounded-lg border bg-cambridge-50 p-4">
        <p className="mb-2 text-sm font-medium text-cambridge-800">
          Nhận dạng giọng nói miễn phí (Web Speech API)
        </p>
        <div className="flex flex-wrap gap-2">
          {!recording ? (
            <Button
              type="button"
              onClick={() => {
                if (speechSupported === null) checkSupport();
                void startRecording();
              }}
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
              Bắt đầu nói
            </Button>
          ) : (
            <Button type="button" variant="destructive" onClick={stopRecording}>
              <Square className="h-4 w-4" />
              Dừng & gửi chấm
            </Button>
          )}
          {hideTranscript && !showManualFallback && speechSupported !== false && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowManualFallback(true)}
            >
              Mic lỗi? Nhập tay
            </Button>
          )}
        </div>

        {(recording || liveTranscript) && !hideTranscript && (
          <div className="mt-3 rounded-md bg-white p-3 text-sm">
            <p className="mb-1 text-xs text-muted-foreground">
              {recording ? "Đang nghe..." : "Transcript:"}
            </p>
            <p className="whitespace-pre-wrap">{liveTranscript || "..."}</p>
          </div>
        )}

        {hideTranscript && recording && (
          <p className="mt-3 text-sm font-medium text-purple-700">
            🎙️ Đang ghi âm — hãy nói bằng tiếng Anh, rồi bấm Dừng & gửi chấm
          </p>
        )}
      </div>

      {showManual && (
        <div className="space-y-2 rounded-lg border border-dashed p-4">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4" />
            {hideTranscript ? "Nhập transcript thủ công (nếu micro không hoạt động)" : "Hoặc nhập transcript thủ công"}
          </Label>
          <Textarea
            placeholder="Type what you said in English..."
            value={manualText}
            onChange={(e) => {
              const next = maxWords ? trimToWordLimit(e.target.value, maxWords) : e.target.value;
              setManualText(next);
            }}
            rows={4}
            disabled={disabled}
          />
          {maxWords && (
            <p className="text-xs text-muted-foreground">
              {manualWordCount}/{maxWords} từ (giới hạn gói)
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={manualText.trim().length < 3 || disabled}
            onClick={submitManual}
          >
            Gửi transcript
          </Button>
        </div>
      )}
    </div>
  );
}
