"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import type { UIMessage } from "ai";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { WelcomeScreen } from "@/components/welcome-screen";

interface ChatPanelProps {
  readonly chatId: string;
  readonly initialMessages: UIMessage[];
  readonly onMessagesChange: (messages: UIMessage[]) => void;
}

/**
 * 聊天面板组件 —— 负责整个对话区域的核心逻辑。
 *
 * 职责：
 * 1. 通过 Vercel AI SDK 的 useChat() Hook 与后端 /api/chat 建立流式通信
 * 2. 渲染消息列表（ChatMessage）或欢迎屏（WelcomeScreen）
 * 3. 管理用户输入状态和发送/停止操作
 * 4. 消息变化时自动滚动到底部，并通知父组件持久化消息
 */
export function ChatPanel({
  chatId,
  initialMessages,
  onMessagesChange,
}: ChatPanelProps) {
  // useChat：Vercel AI SDK 提供的 Hook，自动管理消息列表和流式请求
  // - messages: 当前会话的所有消息
  // - sendMessage: 发送一条新的用户消息
  // - status: 请求状态（"streaming" | "submitted" | "ready" | "error"）
  // - stop: 中断当前流式响应
  // - error: 请求错误信息
  const { messages, sendMessage, status, stop, error } = useChat({
    id: chatId,
    messages: initialMessages,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 消息列表变化时自动滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // 消息变化时通知父组件持久化（写入 localStorage）
  useEffect(() => {
    if (messages.length > 0) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // 正在生成回复或等待服务端响应
  const isLoading = status === "streaming" || status === "submitted";

  /**
   * 发送消息：支持传入文本（来自快捷建议点击）或使用输入框当前值。
   * 发送后清空输入框。
   */
  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || isLoading) return;
      sendMessage({ text: msg });
      setInput("");
    },
    [input, isLoading, sendMessage],
  );

  return (
    <>
      {/* ── 消息列表区域（可滚动） ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // 无消息时展示欢迎屏，点击建议卡片直接发送
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* AI 正在思考的加载指示器（三个跳动的圆点） */}
            {isLoading &&
              messages.at(-1)?.role !== "assistant" && (
                <div className="flex gap-3 animate-in fade-in-0 duration-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] shadow-[0_0_12px_rgba(0,229,255,0.15)]">
                    <span className="text-sm text-[var(--color-neon-cyan)]">⟐</span>
                  </div>
                  <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] bg-[rgba(10,22,40,0.6)] px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-neon-cyan)] shadow-[0_0_6px_rgba(0,229,255,0.5)] [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-neon-blue)] shadow-[0_0_6px_rgba(41,121,255,0.5)] [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-neon-purple)] shadow-[0_0_6px_rgba(176,64,255,0.5)] [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

            {/* 错误提示 */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-[rgba(255,0,144,0.2)] bg-[rgba(255,0,144,0.05)] px-4 py-3 text-sm text-[var(--color-neon-pink)] animate-in fade-in-0 duration-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">请求出错了</p>
                  <p className="mt-1 text-xs opacity-80">
                    {error.message || "未知错误，请重试"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 底部输入区域 ── */}
      <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-4 pt-2">
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSend={() => handleSend()}
          onStop={stop}
        />
        <p className="mt-2 text-center font-mono text-[10px] tracking-wider text-[rgba(0,229,255,0.25)]">
          DailyMate 可能会犯错，请核实重要信息。
        </p>
      </div>
    </>
  );
}
