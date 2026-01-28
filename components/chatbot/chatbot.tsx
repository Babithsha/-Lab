"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ChatBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ type: "user" | "bot"; content: string }>>([
    {
      type: "bot",
      content:
        "Hello! I'm your Lab Assistant. I can help you with experiment procedures, safety guidelines, equipment info, and FAQs. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setMessages((prev) => [...prev, { type: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch("/api/gemini-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, { type: "user", content: userMessage }] }),
      });
      const data = await res.json();
      let reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.generated_text ||
        data.error ||
        "Sorry, I couldn't process your request.";
      setMessages((prev) => [...prev, { type: "bot", content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Oops! AI error: " + err.message },
      ]);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-slate-800">
      <div className="flex justify-between items-center p-3 border-b border-slate-700">
        <h3 className="font-semibold text-white text-sm">Lab Assistant</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          ✕
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #1e293b'
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs p-3 rounded text-sm ${msg.type === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-200"
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 p-3 rounded text-sm">
              <span className="inline-block animate-pulse">●</span>
              <span className="inline-block animate-pulse" style={{ animationDelay: "0.2s" }}>
                ●
              </span>
              <span className="inline-block animate-pulse" style={{ animationDelay: "0.4s" }}>
                ●
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 p-3">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-500 text-sm"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 px-3"
            size="sm"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
