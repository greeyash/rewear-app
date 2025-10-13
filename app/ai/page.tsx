"use client";

import { useState } from "react";

export default function GeminiChat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const sendPrompt = async () => {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.success) setResponse(data.data);
    else setResponse("Error: " + data.error);
  };

  return (
    <div className="p-6">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Tulis pertanyaanmu"
        className="w-full border p-2 mb-2"
      />
      <button onClick={sendPrompt} className="bg-blue-600 text-white px-4 py-2 rounded">
        Kirim ke Pips
      </button>

      {response && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
