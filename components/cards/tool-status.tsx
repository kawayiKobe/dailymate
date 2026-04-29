"use client";

import {
  Cloud,
  Search,
  Newspaper,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle2,
  ChevronDown,
  UserCog,
  Save,
} from "lucide-react";
import { useState } from "react";

interface ToolStatusProps {
  toolName: string;
  state: string;
  input?: unknown;
  output?: unknown;
}

/**
 * 工具配置表 —— 将每个工具名映射到对应的图标、中文标签和主题色。
 * 新增工具时在此表中添加一行即可自动生效。
 */
const TOOL_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    glow: string;
  }
> = {
  get_weather: {
    icon: Cloud,
    label: "查询天气",
    color: "text-[var(--color-neon-blue)]",
    glow: "rgba(var(--neon-blue-rgb),0.15)",
  },
  web_search: {
    icon: Search,
    label: "搜索网页",
    color: "text-[var(--color-neon-cyan)]",
    glow: "rgba(var(--neon-cyan-rgb),0.15)",
  },
  get_daily_briefing: {
    icon: Newspaper,
    label: "获取每日简报",
    color: "text-amber-400",
    glow: "rgba(251,191,36,0.15)",
  },
  get_holidays: {
    icon: Calendar,
    label: "查询假期",
    color: "text-[var(--color-neon-purple)]",
    glow: "rgba(var(--neon-purple-rgb),0.15)",
  },
  plan_travel: {
    icon: MapPin,
    label: "旅游规划",
    color: "text-[var(--color-neon-pink)]",
    glow: "rgba(var(--neon-pink-rgb),0.15)",
  },
  get_preferences: {
    icon: UserCog,
    label: "读取偏好",
    color: "text-[var(--color-neon-cyan)]",
    glow: "rgba(var(--neon-cyan-rgb),0.15)",
  },
  save_preferences: {
    icon: Save,
    label: "保存偏好",
    color: "text-teal-400",
    glow: "rgba(45,212,191,0.15)",
  },
};

/** 根据工具名称从 input 参数中提取人类可读的摘要文本 */
function formatInput(toolName: string, input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const obj = input as Record<string, unknown>;
  switch (toolName) {
    case "get_weather":
      return obj.city ? String(obj.city) : "";
    case "web_search":
      return obj.query ? `"${String(obj.query)}"` : "";
    case "get_daily_briefing":
      return obj.category ? String(obj.category) : "";
    case "get_holidays":
      return [obj.country, obj.year].filter(Boolean).map(String).join(" ") || "";
    case "plan_travel":
      return obj.destination
        ? `${String(obj.destination)} · ${obj.days != null ? String(obj.days) : "?"}天`
        : "";
    default:
      return JSON.stringify(input);
  }
}

/**
 * 工具调用状态指示器 —— 展示在 AI 消息内部，表示某个工具正在执行或已完成。
 *
 * - 执行中：显示旋转加载图标
 * - 已完成：显示勾号，可点击展开查看原始 JSON 输出
 */
export function ToolStatus({ toolName, state, input, output }: ToolStatusProps) {
  const [expanded, setExpanded] = useState(false);
  const config = TOOL_CONFIG[toolName] ?? {
    icon: Search,
    label: toolName,
    color: "text-muted-foreground",
    glow: "rgba(var(--neon-cyan-rgb),0.1)",
  };
  const Icon = config.icon;
  const isDone = state === "output-available";
  const inputSummary = formatInput(toolName, input);

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-[rgba(var(--neon-cyan-rgb),0.08)] bg-[var(--th-card-inner-bg)] text-xs backdrop-blur-sm">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 transition-colors hover:bg-[rgba(var(--neon-cyan-rgb),0.03)]"
        onClick={() => isDone && output && setExpanded(!expanded)}
      >
        {/* 状态图标：加载中 → 旋转；已完成 → 勾号 */}
        {isDone ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--color-neon-cyan)]" style={{ filter: `drop-shadow(0 0 4px ${config.glow})` }} />
        ) : (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--color-neon-cyan)]" />
        )}
        <Icon className={`h-3.5 w-3.5 shrink-0 ${config.color}`} />
        <span className="font-medium">{config.label}</span>
        {/* 输入参数摘要（如城市名、搜索关键词等） */}
        {inputSummary && (
          <span className="truncate text-muted-foreground">
            {inputSummary}
          </span>
        )}
        {/* 展开/收起箭头 */}
        {isDone && !!output && (
          <ChevronDown
            className={`ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
      {/* 展开后显示工具原始输出（JSON），最多显示 1000 字符 */}
      {expanded && !!output && (
        <div className="max-h-40 overflow-auto border-t border-[rgba(var(--neon-cyan-rgb),0.08)] px-3 py-2">
          <pre className="whitespace-pre-wrap break-all font-mono text-[10px] text-muted-foreground">
            {typeof output === "string"
              ? output.slice(0, 1000)
              : JSON.stringify(output, null, 2).slice(0, 1000)}
          </pre>
        </div>
      )}
    </div>
  );
}
