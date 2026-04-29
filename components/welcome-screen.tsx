"use client";

import { Cloud, Newspaper, Plane, Calendar, Cpu } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

/**
 * 快捷建议列表 —— 当聊天记录为空时，展示 4 个可点击的预设提问卡片。
 * 每个卡片有独立的图标、标签、预设提问文本以及对应的颜色主题。
 */
const suggestions = [
  {
    icon: Newspaper,
    label: "今日 AI 简报",
    prompt: "给我看看今天的 AI 简报",
    border: "rgba(var(--neon-cyan-rgb), 0.2)",
    glow: "rgba(var(--neon-cyan-rgb), 0.06)",
    iconColor: "text-[var(--color-neon-cyan)]",
  },
  {
    icon: Cloud,
    label: "天气查询",
    prompt: "今天北京天气怎么样？",
    border: "rgba(var(--neon-blue-rgb), 0.2)",
    glow: "rgba(var(--neon-blue-rgb), 0.06)",
    iconColor: "text-[var(--color-neon-blue)]",
  },
  {
    icon: Plane,
    label: "旅游规划",
    prompt: "帮我规划一个 5 天的京都旅行，预算 8000 元",
    border: "rgba(var(--neon-purple-rgb), 0.2)",
    glow: "rgba(var(--neon-purple-rgb), 0.06)",
    iconColor: "text-[var(--color-neon-purple)]",
  },
  {
    icon: Calendar,
    label: "假期攻略",
    prompt: "2026 年有哪些假期可以拼假？",
    border: "rgba(var(--neon-pink-rgb), 0.2)",
    glow: "rgba(var(--neon-pink-rgb), 0.06)",
    iconColor: "text-[var(--color-neon-pink)]",
  },
];

/**
 * 欢迎屏组件 —— 无聊天记录时展示的首屏。
 *
 * 包含品牌 Logo、应用名、功能简介和 4 张快捷建议卡片。
 * 点击卡片会直接发送对应的预设提问。
 */
export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 animate-in fade-in-0 duration-700">
      {/* ── Logo 区域：图标 + 多层光晕 ── */}
      <div className="relative mb-6">
        <div className="absolute -inset-6 rounded-full bg-[rgba(var(--neon-cyan-rgb),0.06)] blur-2xl" />
        <div className="absolute -inset-3 rounded-full bg-[rgba(var(--neon-cyan-rgb),0.04)] blur-xl pulse-ring" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[rgba(var(--neon-cyan-rgb),0.2)] bg-[rgba(var(--neon-cyan-rgb),0.06)] shadow-[0_0_30px_rgba(var(--neon-cyan-rgb),0.1)]">
          <Cpu className="h-9 w-9 text-[var(--color-neon-cyan)]" />
        </div>
      </div>

      <h1 className="mb-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[0.12em] uppercase glow-text">
        DailyMate
      </h1>
      <p className="mb-8 font-mono text-xs tracking-[0.1em] text-muted-foreground">
        [ 简报 · 天气 · 旅行 · 假期 ]
      </p>

      {/* 装饰性分割线：左右渐变 + 中间菱形 */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(var(--neon-cyan-rgb),0.3)]" />
        <div className="h-1.5 w-1.5 rotate-45 border border-[rgba(var(--neon-cyan-rgb),0.4)] bg-[rgba(var(--neon-cyan-rgb),0.15)]" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(var(--neon-cyan-rgb),0.3)]" />
      </div>

      {/* ── 快捷建议卡片 2×2 网格 ── */}
      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {suggestions.map((s, i) => (
          <button
            key={s.label}
            onClick={() => onSuggestionClick(s.prompt)}
            className="group relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-3 duration-500"
            style={{
              animationDelay: `${i * 120}ms`,
              animationFillMode: "both",
              borderColor: s.border,
              backgroundColor: s.glow,
              boxShadow: `0 0 20px ${s.glow}`,
            }}
          >
            {/* hover 时的径向渐变光效 */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `radial-gradient(circle at 30% 30%, ${s.glow}, transparent 70%)` }}
            />

            <s.icon
              className={`relative mt-0.5 h-5 w-5 shrink-0 ${s.iconColor} transition-all group-hover:drop-shadow-[0_0_8px_currentColor]`}
            />
            <div className="relative">
              <div className="text-sm font-semibold tracking-wide">{s.label}</div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {s.prompt}
              </div>
            </div>

            {/* 右上角装饰性渐变三角 */}
            <div
              className="absolute -right-1 -top-1 h-6 w-6 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${s.border}, transparent)`,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
