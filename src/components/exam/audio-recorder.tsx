"use client";

import { useRef, useState } from "react";
import { Mic, Square, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AudioRecorderProps {
  /** Called with transcript from Web Speech API or manual input */
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function AudioRecorder({ onTranscript, disabled }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  const checkSupport = () => {
    const supported = !!getSpeechRecognition();
    setSpeechSupported(supported);
    return supported;
  };

  const startRecording = () => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    finalTranscriptRef.current = "";
    setLiveTranscript("");
    setSpeechSupported(true);

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
      setLiveTranscript((finalText + interim).trim());
    };

    recognition.onerror = () => {
      setRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);

    const text = (finalTranscriptRef.current || liveTranscript).trim();
    if (text.length >= 3) {
      onTranscript(text);
    }
  };

  const submitManual = () => {
    const text = manualText.trim();
    if (text.length >= 3) onTranscript(text);
  };

  return (
    <div className="space-y-4">
      {speechSupported === false && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Trình duyệt không hỗ trợ Web Speech API. Hãy dùng Chrome/Edge, hoặc nhập
            transcript thủ công bên dưới. (Tuỳ chọn server: bật{" "}
            <code className="rounded bg-amber-100 px-1">SPEECH_TO_TEXT_MODE=gemini</code>{" "}
            để gửi file audio lên Gemini.)
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
                startRecording();
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
        </div>

        {(recording || liveTranscript) && (
          <div className="mt-3 rounded-md bg-white p-3 text-sm">
            <p className="mb-1 text-xs text-muted-foreground">
              {recording ? "Đang nghe..." : "Transcript:"}
            </p>
            <p className="whitespace-pre-wrap">{liveTranscript || "..."}</p>
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-dashed p-4">
        <Label className="flex items-center gap-2 text-muted-foreground">
          <Upload className="h-4 w-4" />
          Hoặc nhập transcript thủ công
        </Label>
        <Textarea
          placeholder="Type what you said in English..."
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={4}
          disabled={disabled}
        />
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
    </div>
  );
}
