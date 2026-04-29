"use client";

import { useState, useEffect, useCallback } from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { ChatPanel } from "@/components/chat-panel";
import {
  type Conversation,
  getConversations,
  createConversation,
  deleteConversation,
  getMessages,
  saveMessages,
} from "@/lib/conversations";

/**
 * 首页组件 —— 整个应用的主入口。
 *
 * 职责：
 * 1. 管理会话列表（conversations）和当前选中的会话 ID（activeId）
 * 2. 控制左侧栏的展开/收起
 * 3. 协调 Sidebar ↔ ChatPanel 之间的交互（新建/切换/删除会话）
 *
 * 数据全部存储在浏览器 localStorage 中，通过 @/lib/conversations 读写。
 */
export default function Home() {
  // 会话列表
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // 当前激活的会话 ID
  const [activeId, setActiveId] = useState<string | null>(null);
  // 侧栏是否展开
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // 客户端水合标记：防止 SSR/CSR 不一致导致的闪烁
  const [hydrated, setHydrated] = useState(false);

  // 首次挂载时从 localStorage 加载会话列表；如果为空则自动创建一个新会话
  useEffect(() => {
    const list = getConversations();
    setConversations(list);
    if (list.length > 0) {
      setActiveId(list[0].id);
    } else {
      const conv = createConversation();
      setConversations([conv]);
      setActiveId(conv.id);
    }
    setHydrated(true);
  }, []);

  /** 从 localStorage 重新读取会话列表并更新 state */
  const refreshList = useCallback(() => {
    setConversations(getConversations());
  }, []);

  /** 当聊天消息变化时，持久化到 localStorage 并刷新列表（标题可能更新） */
  const handleMessagesChange = useCallback(
    (messages: Parameters<typeof saveMessages>[1]) => {
      if (activeId) {
        saveMessages(activeId, messages);
        refreshList();
      }
    },
    [activeId, refreshList],
  );

  /** 新建会话：如果已有空会话则复用，否则创建新会话 */
  const handleNewChat = useCallback(() => {
    const list = getConversations();
    const emptyConv = list.find((c) => getMessages(c.id).length === 0);
    if (emptyConv) {
      setActiveId(emptyConv.id);
      return;
    }
    const conv = createConversation();
    refreshList();
    setActiveId(conv.id);
  }, [refreshList]);

  /** 切换到指定会话 */
  const handleSelectConversation = useCallback(
    (id: string) => {
      if (id === activeId) return;
      setActiveId(id);
    },
    [activeId],
  );

  /** 删除会话后，自动激活剩余列表中的第一个；如果全部删光则新建一个 */
  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
      const remaining = getConversations();
      setConversations(remaining);
      if (id === activeId) {
        if (remaining.length > 0) {
          setActiveId(remaining[0].id);
        } else {
          const conv = createConversation();
          setConversations(getConversations());
          setActiveId(conv.id);
        }
      }
    },
    [activeId],
  );

  // 水合完成前不渲染，避免服务端/客户端 HTML 不一致
  if (!hydrated) return null;

  return (
    <div className="relative flex h-dvh overflow-hidden">
      {/* 背景网格动画（纯装饰） */}
      <div className="cyber-grid" />

      {/* ── 左侧栏：会话列表 ── */}
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onDelete={handleDeleteConversation}
        />
      )}

      {/* ── 右侧主区域 ── */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* 顶部导航栏：侧栏开关 + 品牌标识 */}
        <header className="flex shrink-0 items-center justify-between border-b border-[rgba(var(--neon-cyan-rgb),0.1)] bg-[var(--th-header-bg)] px-4 py-3 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-[rgba(var(--neon-cyan-rgb),0.08)] hover:text-[var(--color-neon-cyan)] hover:shadow-[0_0_12px_rgba(var(--neon-cyan-rgb),0.15)]"
            title={sidebarOpen ? "收起侧栏" : "展开侧栏"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="font-[var(--font-mono)] text-[10px] tracking-[0.15em] uppercase text-[rgba(var(--neon-cyan-rgb),0.4)]">
              Powered by LangGraph
            </span>
          </div>
        </header>

        {/* 聊天面板：key={activeId} 确保切换会话时整个组件重新挂载 */}
        {activeId && (
          <ChatPanel
            key={activeId}
            chatId={activeId}
            initialMessages={getMessages(activeId)}
            onMessagesChange={handleMessagesChange}
          />
        )}
      </div>
    </div>
  );
}
