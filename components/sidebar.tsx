"use client";

import { MessageSquarePlus, Trash2, MessageCircle, Cpu } from "lucide-react";
import type { Conversation } from "@/lib/conversations";

interface SidebarProps {
  readonly conversations: Conversation[];
  readonly activeId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onNewChat: () => void;
  readonly onDelete: (id: string) => void;
}

/**
 * 左侧边栏组件 —— 展示会话历史列表。
 *
 * 功能：
 * - 顶部：品牌 Logo + 「新建对话」按钮
 * - 中部：可滚动的会话列表，点击切换，悬浮显示删除按钮
 * - 底部：技术栈标识
 */
export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
}: SidebarProps) {
  return (
    <aside className="relative z-10 flex h-full w-64 shrink-0 flex-col border-r border-[rgba(var(--neon-cyan-rgb),0.1)] bg-[var(--th-sidebar-bg)] backdrop-blur-xl">
      {/* ── 顶部：品牌 + 新建按钮 ── */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2.5">
          {/* Logo 图标，带脉冲光环动画 */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(var(--neon-cyan-rgb),0.08)] ring-1 ring-[rgba(var(--neon-cyan-rgb),0.2)]">
            <Cpu className="h-4 w-4 text-[var(--color-neon-cyan)]" />
            <div className="absolute inset-0 rounded-lg bg-[rgba(var(--neon-cyan-rgb),0.1)] pulse-ring" />
          </div>
          <span className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[0.08em] uppercase glow-text">
            DailyMate
          </span>
        </div>
        <button
          onClick={onNewChat}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-[rgba(var(--neon-cyan-rgb),0.08)] hover:text-[var(--color-neon-cyan)] hover:shadow-[0_0_12px_rgba(var(--neon-cyan-rgb),0.15)]"
          title="新对话"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>

      {/* 渐变分割线 */}
      <div className="mx-3 mb-2 h-px bg-gradient-to-r from-transparent via-[rgba(var(--neon-cyan-rgb),0.2)] to-transparent" />

      {/* ── 会话列表（可滚动） ── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-muted-foreground">
            还没有对话
          </p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all cursor-pointer ${
                  conv.id === activeId
                    ? "bg-[rgba(var(--neon-cyan-rgb),0.08)] text-foreground border border-[rgba(var(--neon-cyan-rgb),0.15)] shadow-[0_0_12px_rgba(var(--neon-cyan-rgb),0.06)]"
                    : "text-muted-foreground border border-transparent hover:bg-[rgba(var(--neon-cyan-rgb),0.04)] hover:text-foreground hover:border-[rgba(var(--neon-cyan-rgb),0.08)]"
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <MessageCircle className={`h-3.5 w-3.5 shrink-0 ${conv.id === activeId ? "text-[var(--color-neon-cyan)]" : ""}`} />
                <span className="flex-1 truncate">{conv.title}</span>
                {/* 删除按钮：仅在 hover 父按钮时可见；stopPropagation 防止触发外层的 onSelect */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-[rgba(var(--neon-pink-rgb),0.15)] hover:text-[var(--color-neon-pink)] group-hover:opacity-100"
                  title="删除对话"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 底部标识 ── */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[rgba(var(--neon-cyan-rgb),0.15)] to-transparent" />
      <div className="px-3 py-2">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[rgba(var(--neon-cyan-rgb),0.3)]">
          ◈ Powered by LangGraph
        </span>
      </div>
    </aside>
  );
}
