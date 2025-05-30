"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function FlatChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: "user", content: input }]);
    setLoading(true);

    const res = await fetch("/api/chat/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const text = await res.text();

    setMessages((m) => [...m, { role: "assistant", content: text }]);
    setInput("");
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="space-y-4 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user" ? "text-right text-blue-800" : "text-left text-gray-800"
            }
          >
            <strong>{m.role === "user" ? "You:" : "Duub.ai:"}</strong> {m.content}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          className="flex-1 border rounded-l px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask me anything about Dubai…"
          disabled={loading}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-r"
          onClick={send}
          disabled={loading}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
