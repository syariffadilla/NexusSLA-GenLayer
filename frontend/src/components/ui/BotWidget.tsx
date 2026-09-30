"use client";

import React, { useState } from "react";
import { Send, X } from "lucide-react";

export function BotWidget() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      sender: "bot",
      text: "Hi! I am the GenLayer Portal assistant for NexusSLA. Ask me about active SLA agreements, AI consensus verdicts, or filing claims.",
    },
  ]);

  const handleSend = () => {
    if (!msg.trim()) return;
    const userMsg = msg;
    setChatLog((prev) => [...prev, { sender: "user", text: userMsg }]);
    setMsg("");

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `NexusSLA contracts are running on GenLayer Studio (0x006a...3519). All uptime claims are autonomously adjudicated by multi-source AI consensus!`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* Bot Chat Window */}
      {open && (
        <div className="absolute bottom-14 sm:bottom-16 right-0 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
                🐱
              </div>
              <div>
                <div className="text-xs font-bold">GenLayer Agent Bot</div>
                <div className="text-[10px] text-purple-200">SLA Court Concierge</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white bg-transparent border-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 h-56 sm:h-64 overflow-y-auto space-y-2 text-xs bg-slate-50">
            {chatLog.map((c, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl max-w-[85%] ${
                  c.sender === "bot"
                    ? "bg-white text-slate-800 border border-slate-200 mr-auto"
                    : "bg-purple-600 text-white ml-auto"
                }`}
              >
                {c.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-200 bg-white flex gap-1.5 items-center">
            <input
              type="text"
              className="input-field text-xs py-1.5 px-3 flex-1"
              placeholder="Ask GenLayer Agent..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 border-none cursor-pointer"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Cyber-Cat Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative group w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all border-2 border-white cursor-pointer"
        title="GenLayer Agent"
        aria-label="Open Agent Chat"
      >
        <div className="text-xl sm:text-2xl filter drop-shadow">
          🐱
        </div>
        {/* Telegram circular blue badge */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#0088cc] text-white flex items-center justify-center border-2 border-white shadow">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
        </div>
      </button>
    </div>
  );
}
