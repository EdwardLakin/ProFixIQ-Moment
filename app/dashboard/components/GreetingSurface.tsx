"use client";

import { useMemo, useRef, useState } from "react";
import { MomentTextarea } from "@/components/moment/MomentTextarea";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function GreetingSurface({ headline, opening, text, onText }: { headline: string; opening: string; text: string; onText: (value: string) => void }) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const canUseVoice = useMemo(() => typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window), []);

  function toggleVoiceInput() {
    if (!canUseVoice) return;
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onText(text ? `${text} ${transcript}` : transcript);
    };
    recognition.onerror = () => setVoiceError("Voice input is unavailable right now. You can keep typing.");
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setVoiceError(null);
    setListening(true);
    recognition.start();
  }

  return <section className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(160deg,#151629,#111522_60%,#131b2d)] p-5 shadow-[0_10px_45px_-35px_rgba(196,181,253,0.95)] sm:p-7">
    <p className="text-xs tracking-[0.04em] text-[#e8dbff]/70">{headline}</p>
    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f7efe3] sm:text-3xl">Tell Moment what’s going on.</h2>
    <p className="mt-3 max-w-2xl text-sm text-[#d9d8e8]">{opening}</p>
    <div className="mt-4 rounded-2xl border border-white/10 bg-[#0c1020]/60 p-2">
      <MomentTextarea rows={5} value={text} onChange={(event) => onText(event.target.value)} placeholder="Anything is okay: ‘I’m spiraling,’ ‘I can’t focus,’ ‘I feel awful,’ or wherever you want to begin." className="border-0 bg-transparent p-2" />
      <div className="mt-2 flex items-center justify-between px-1 pb-1">
        <p className="text-xs text-[#b9bad1]">Voice input is optional and stays in your current draft.</p>
        <button type="button" onClick={toggleVoiceInput} disabled={!canUseVoice} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-100 transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-55">
          {canUseVoice ? (listening ? "Stop mic" : "Use mic") : "Mic unavailable"}
        </button>
      </div>
    </div>
    {voiceError ? <p className="mt-2 text-xs text-amber-200">{voiceError}</p> : null}
  </section>;
}
