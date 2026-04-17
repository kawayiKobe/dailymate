"use client";

import { CalendarDays, PartyPopper } from "lucide-react";

interface Holiday {
  name: string;
  date: string;  // 单日 "2026-01-01" 或区间 "2026-02-17~02-23"
  type: string;
}

/** 假期工具返回的完整数据结构 */
interface HolidayData {
  country: string;
  year: number;
  holidays: Holiday[];
  note?: string;
}

/** 安全解析假期工具输出 */
function parseHolidays(output: unknown): HolidayData | null {
  try {
    const data = typeof output === "string" ? JSON.parse(output) : output;
    if (data && Array.isArray(data.holidays)) return data as HolidayData;
    return null;
  } catch {
    return null;
  }
}

/** 根据假期名称匹配对应的 emoji（用于列表展示） */
const HOLIDAY_EMOJIS: Record<string, string> = {
  元旦: "🎆",
  春节: "🧨",
  清明: "🌿",
  劳动: "💪",
  端午: "🐉",
  中秋: "🌕",
  国庆: "🇨🇳",
};

function getEmoji(name: string): string {
  for (const [key, emoji] of Object.entries(HOLIDAY_EMOJIS)) {
    if (name.includes(key)) return emoji;
  }
  return "🎉";
}

/** 判断假期是否尚未过去（用于高亮「即将到来」的假期） */
function isUpcoming(dateStr: string): boolean {
  const now = new Date();
  const parts = dateStr.split("~");
  const end = parts[parts.length - 1];
  return new Date(end) >= now;
}

/**
 * 假期卡片组件 —— 以列表形式展示某国某年的所有法定假期。
 *
 * - 即将到来的假期：正常亮度 + 绿色「即将到来」标签
 * - 已过去的假期：半透明显示
 */
export function HolidayCard({ output }: { output: unknown }) {
  const data = parseHolidays(output);
  if (!data || data.holidays.length === 0) return null;

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[rgba(176,64,255,0.15)] bg-[rgba(176,64,255,0.03)] shadow-[0_0_20px_rgba(176,64,255,0.04)]">
      {/* 头部：标题 + 假期总数 */}
      <div className="flex items-center gap-2 border-b border-[rgba(176,64,255,0.1)] px-4 py-3">
        <CalendarDays className="h-4 w-4 text-[var(--color-neon-purple)]" style={{ filter: "drop-shadow(0 0 6px rgba(176,64,255,0.4))" }} />
        <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wider">
          {data.country} {data.year} 年假期
        </span>
        <span className="ml-auto rounded-full border border-[rgba(176,64,255,0.2)] bg-[rgba(176,64,255,0.08)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-neon-purple)]">
          {data.holidays.length} 个假期
        </span>
      </div>

      {/* 假期列表 */}
      <div className="divide-y divide-[rgba(176,64,255,0.06)]">
        {data.holidays.map((h, i) => {
          const upcoming = isUpcoming(h.date);
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                upcoming
                  ? "bg-[rgba(176,64,255,0.03)]"
                  : "opacity-50"
              }`}
            >
              <span className="text-lg">{getEmoji(h.name)}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{h.name}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-muted-foreground">
                  {h.date}
                </span>
                {upcoming && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-[rgba(0,229,255,0.2)] bg-[rgba(0,229,255,0.06)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-neon-cyan)]">
                    <PartyPopper className="h-2.5 w-2.5" />
                    即将到来
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
