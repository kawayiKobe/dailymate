"use client";

import { useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
}

/**
 * 聊天输入框组件。
 *
 * 特性：
 * - 多行文本框，自动根据内容高度扩展（最高 200px）
 * - Enter 发送，Shift+Enter 换行
 * - 生成中显示「停止」按钮，空闲时显示「发送」按钮
 * - 聚焦时边框发光增强
 */
export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSend,
  onStop,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 根据文本内容动态调整 textarea 高度
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  }, [input]);

  /** Enter 发送消息；Shift+Enter 换行 */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(var(--neon-cyan-rgb),0.15)] bg-[var(--th-input-bg)] p-2 shadow-[0_0_20px_rgba(var(--neon-cyan-rgb),0.06)] backdrop-blur-md transition-all focus-within:border-[rgba(var(--neon-cyan-rgb),0.35)] focus-within:shadow-[0_0_30px_rgba(var(--neon-cyan-rgb),0.1)]">
      {/* 顶部装饰性发光线 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--neon-cyan-rgb),0.3)] to-transparent" />

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入指令... 试试「今天有什么 AI 新闻？」"
          rows={1}
          className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--th-placeholder-fg)]"
        />
        {isLoading ? (
          /* 停止生成按钮 */
          <button
            type="button"
            onClick={onStop}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(var(--neon-pink-rgb),0.2)] bg-[rgba(var(--neon-pink-rgb),0.08)] text-[var(--color-neon-pink)] transition-all hover:bg-[rgba(var(--neon-pink-rgb),0.15)] hover:shadow-[0_0_15px_rgba(var(--neon-pink-rgb),0.15)]"
          >
            <Square className="h-3 w-3" />
          </button>
        ) : (
          /* 发送按钮：输入为空时禁用 */
          <button
            type="button"
            disabled={!input.trim()}
            onClick={onSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(var(--neon-cyan-rgb),0.3)] bg-[rgba(var(--neon-cyan-rgb),0.1)] text-[var(--color-neon-cyan)] transition-all hover:bg-[rgba(var(--neon-cyan-rgb),0.2)] hover:shadow-[0_0_15px_rgba(var(--neon-cyan-rgb),0.2)] disabled:opacity-30 disabled:hover:shadow-none"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
