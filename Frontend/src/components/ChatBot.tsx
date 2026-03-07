"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Volume2, Mic } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

type Message = {
  role: "user" | "model";
  content: string;
  audioUrl?: string;
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function speak(text: string) {
    if (!text.trim()) return;
    if (!API_BASE_URL) return; // TTS is provided by the backend when NEXT_PUBLIC_API_URL is set

    try {
      const res = await fetch(`${API_BASE_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        let errorMessage = "Voice playback is currently unavailable.";
        try {
          const data = await res.json();
          if (data?.error && typeof data.error === "string") {
            errorMessage = data.error;
          }
        } catch {
          // ignore JSON parse errors
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `(Voice error: ${errorMessage})`,
          },
        ]);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex].role === "model" && updated[lastIndex].content === text) {
          updated[lastIndex] = { ...updated[lastIndex], audioUrl: url };
        }
        return updated;
      });

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {
          // autoplay might be blocked; user can tap the play button
        });
      }
    } catch {
      // ignore ElevenLabs failures; user still sees text
    }
  }

  function playAudio(url?: string) {
    if (!url || !audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.play().catch(() => {
      // ignore play errors
    });
  }

  function startListening() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript as string | undefined;
      if (!transcript) return;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }

  function toggleListening() {
    if (loading) return;
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);

    if (!API_BASE_URL) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "The StraitWatch Assistant requires the backend. Set NEXT_PUBLIC_API_URL in Frontend/.env.local (e.g. http://localhost:8000) and run the backend (cd Backend && npm run dev). See README.",
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      let data: { content?: string; error?: string };
      try {
        const raw = await res.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `Server returned invalid response (${res.status}). Is the backend running?`,
          },
        ]);
        return;
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.error ?? "Something went wrong." },
        ]);
        return;
      }

      const replyText: string = data.content ?? "";

      setMessages((prev) => [
        ...prev,
        { role: "model", content: replyText },
      ]);

      if (replyText) {
        void speak(replyText);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `Failed to connect: ${msg}. Is the backend running at ${API_BASE_URL}?`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-blue)] text-white shadow-lg transition hover:bg-[var(--accent-blue)]/90"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex h-[420px] w-[360px] max-w-[calc(100vw-2rem)] sm:max-w-none flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-xl">
          <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white">StraitWatch Assistant</h3>
              <p className="text-xs text-[var(--foreground)]/60">
                Powered by Google Gemini + ElevenLabs
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-[var(--foreground)]/70">
                Ask about regional risk, events, shipping, or the crisis briefing.
                {!API_BASE_URL && (
                  <span className="block mt-2 text-amber-500/90">
                    Set NEXT_PUBLIC_API_URL and run the backend to enable the assistant.
                  </span>
                )}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
                    m.role === "user"
                      ? "bg-[var(--accent-blue)] text-white"
                      : "bg-[var(--border)] text-[var(--foreground)]"
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words">{m.content}</span>
                  {m.role === "model" && m.audioUrl && (
                    <button
                      type="button"
                      onClick={() => playAudio(m.audioUrl)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-[var(--foreground)] hover:bg-black/30"
                      aria-label="Play response audio"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-[var(--border)] px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-blue)]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex gap-2 border-t border-[var(--border)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white placeholder:text-[var(--foreground)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50"
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`rounded-lg p-2 text-white transition ${
                listening
                  ? "bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90"
                  : "bg-[var(--card-bg)] hover:bg-[var(--border)]"
              } disabled:opacity-50`}
              aria-pressed={listening}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-[var(--accent-blue)] p-2 text-white transition hover:bg-[var(--accent-blue)]/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <audio ref={audioRef} hidden />
    </>
  );
}

