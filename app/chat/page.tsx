"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input) return;
    setMsgs((m) => [...m, { role: "user", text: input }]);
    setLoading(true);

    // hit your Next API proxy, e.g. /api/chat/openai
    const res = await fetch("/api/chat/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const answer = await res.text();

    setMsgs((m) => [...m, { role: "assistant", text: answer }]);
    setInput("");
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      {msgs.map((m, i) => (
        <div
          key={i}
          className={
            m.role === "user"
              ? "text-right text-blue-700"
              : "text-left text-gray-800"
          }
        >
          <strong>{m.role === "user" ? "You:" : "Bot:"}</strong> {m.text}
        </div>
      ))}

      <div className="flex">
        <input
          className="flex-1 border px-3 py-2 rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button
          className="px-4 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          onClick={send}
          disabled={loading}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
