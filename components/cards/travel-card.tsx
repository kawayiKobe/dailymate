"use client";

import { MapPin, Clock, Wallet, Heart } from "lucide-react";

/** 旅行规划工具返回的结构化请求数据 */
interface TravelRequest {
  destination: string;
  duration: string;
  budget: string;
  interests: string[];
  startDate: string;
  requestedSections: string[];  // LLM 需要生成的内容板块列表
}

/** 安全解析旅行工具输出 */
function parseTravelRequest(output: unknown): TravelRequest | null {
  try {
    const data = typeof output === "string" ? JSON.parse(output) : output;
    if (data && data.destination) return data as TravelRequest;
    return null;
  } catch {
    return null;
  }
}

/**
 * 旅行规划卡片组件 —— 展示旅行工具收集的结构化参数摘要。
 *
 * 布局：
 * - 上方：目的地名称 + 地图图标
 * - 中间：3 列核心参数（行程天数/预算/兴趣标签）
 * - 底部：出发日期（如果非"灵活"）
 *
 * 注意：这个卡片展示的是工具收集的参数，实际的详细行程由 LLM 根据这些参数生成。
 */
export function TravelCard({ output }: { output: unknown }) {
  const data = parseTravelRequest(output);
  if (!data) return null;

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[rgba(var(--neon-pink-rgb),0.15)] bg-gradient-to-br from-[rgba(var(--neon-pink-rgb),0.04)] to-[rgba(var(--neon-purple-rgb),0.03)] shadow-[0_0_20px_rgba(var(--neon-pink-rgb),0.04)]">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[var(--color-neon-pink)]" style={{ filter: "drop-shadow(0 0 6px rgba(var(--neon-pink-rgb),0.4))" }} />
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wider">{data.destination}</h3>
        </div>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">旅行规划方案</p>
      </div>

      {/* 3 列核心参数 */}
      <div className="grid grid-cols-3 gap-px border-t border-[rgba(var(--neon-pink-rgb),0.1)] bg-[rgba(var(--neon-pink-rgb),0.06)]">
        <InfoCell icon={Clock} label="行程" value={data.duration} />
        <InfoCell icon={Wallet} label="预算" value={data.budget} />
        <InfoCell
          icon={Heart}
          label="兴趣"
          value={data.interests.slice(0, 3).join("·")}
        />
      </div>

      {data.startDate !== "灵活" && (
        <div className="border-t border-[rgba(var(--neon-pink-rgb),0.08)] px-4 py-2 font-mono text-xs text-muted-foreground">
          ◈ 出发日期: {data.startDate}
        </div>
      )}
    </div>
  );
}

/** 单个信息列（图标 + 标签 + 数值） */
function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[var(--th-card-inner-bg)] px-3 py-3 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-[var(--color-neon-pink)] opacity-50" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
