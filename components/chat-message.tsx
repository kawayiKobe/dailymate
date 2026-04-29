"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import type { UIMessage } from "ai";

import { WeatherCard } from "@/components/cards/weather-card";
import { BriefingCard } from "@/components/cards/briefing-card";
import { HolidayCard } from "@/components/cards/holiday-card";
import { TravelCard } from "@/components/cards/travel-card";
import { ToolStatus } from "@/components/cards/tool-status";

/**
 * 单条聊天消息组件。
 *
 * 根据 message.role 区分用户消息和 AI 消息：
 * - 用户消息：紫色主题，头像在右侧
 * - AI 消息：青色主题，头像在左侧
 *
 * 一条消息可能包含多个 part：
 * - text: 纯文本 / Markdown（AI 消息用 ReactMarkdown 渲染）
 * - tool-*: 工具调用状态 + 结果卡片（天气/简报/假期/旅行）
 */
export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* 头像 */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "border border-[rgba(var(--neon-purple-rgb),0.3)] bg-[rgba(var(--neon-purple-rgb),0.1)] text-[var(--color-neon-purple)] shadow-[0_0_12px_rgba(var(--neon-purple-rgb),0.15)]"
            : "border border-[rgba(var(--neon-cyan-rgb),0.3)] bg-[rgba(var(--neon-cyan-rgb),0.08)] text-[var(--color-neon-cyan)] shadow-[0_0_12px_rgba(var(--neon-cyan-rgb),0.15)]"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* 消息气泡 */}
      <div
        className={`min-w-0 rounded-2xl px-4 py-3 ${
          isUser
            ? "max-w-[80%] border border-[rgba(var(--neon-purple-rgb),0.15)] bg-[rgba(var(--neon-purple-rgb),0.06)] text-foreground"
            : "max-w-[85%] border border-[rgba(var(--neon-cyan-rgb),0.08)] bg-[var(--th-msg-ai-bg)] text-foreground backdrop-blur-sm"
        }`}
      >
        {/* 遍历消息的所有 part 进行渲染 */}
        {message.parts.map((part, i) => {
          // ── 文本类型 ──
          if (part.type === "text") {
            // 用户消息：纯文本渲染
            if (isUser) {
              return (
                <p
                  key={i}
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                >
                  {part.text}
                </p>
              );
            }
            // AI 消息：使用 ReactMarkdown 渲染，支持 GFM（表格、删除线等）
            return (
              <div key={i} className="prose-chat text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // 所有链接在新标签页打开
                    a: ({ children, href, ...rest }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                        {children}
                      </a>
                    ),
                  }}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }

          // ── 工具调用类型：展示调用状态 + 结果卡片 ──
          if (isToolPart(part)) {
            const toolName = getToolNameFromPart(part);
            const state = (part as any).state as string;
            const input = (part as any).input;
            const output = (part as any).output;
            const isDone = state === "output-available";

            return (
              <div key={i}>
                {/* 工具调用状态指示器（加载中 / 已完成） */}
                <ToolStatus
                  toolName={toolName}
                  state={state}
                  input={input}
                  output={output}
                />
                {/* 工具返回结果的可视化卡片 */}
                {isDone && output && renderToolCard(toolName, output)}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

/** 判断一个 message part 是否是工具调用类型 */
function isToolPart(part: any): boolean {
  return (
    part.type === "dynamic-tool" ||
    (typeof part.type === "string" &&
      part.type.startsWith("tool-") &&
      "state" in part)
  );
}

/** 从 part 中提取工具名称 */
function getToolNameFromPart(part: any): string {
  if (part.type === "dynamic-tool") return part.toolName ?? "unknown";
  return part.type.replace(/^tool-/, "");
}

/** 根据工具名称渲染对应的可视化卡片组件 */
function renderToolCard(toolName: string, output: unknown): React.ReactNode {
  switch (toolName) {
    case "get_weather":
      return <WeatherCard output={output} />;
    case "get_daily_briefing":
      return <BriefingCard output={output} />;
    case "get_holidays":
      return <HolidayCard output={output} />;
    case "plan_travel":
      return <TravelCard output={output} />;
    default:
      return null;
  }
}
