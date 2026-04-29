"use client";

import { ExternalLink, Rss } from "lucide-react";

/** 单条简报条目 */
interface BriefingItem {
  source: string;   // 来源名称（如 "Hacker News"）
  title: string;    // 文章标题
  link: string;     // 原文链接
  date: string;     // 发布日期
  snippet: string;  // 内容摘要
}

/** 安全解析简报工具输出 */
function parseBriefing(output: unknown): BriefingItem[] | null {
  try {
    const data = typeof output === "string" ? JSON.parse(output) : output;
    if (Array.isArray(data)) return data;
    return null;
  } catch {
    return null;
  }
}

/** 根据来源名称返回对应的标签颜色样式 */
function sourceColor(source: string): string {
  if (source.includes("Hacker")) return "border-orange-500/30 bg-orange-500/10 text-orange-400";
  if (source.includes("JavaScript")) return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (source.includes("CSS")) return "border-[rgba(var(--neon-blue-rgb),0.3)] bg-[rgba(var(--neon-blue-rgb),0.1)] text-[var(--color-neon-blue)]";
  if (source.includes("MIT") || source.includes("Technology"))
    return "border-[rgba(var(--neon-pink-rgb),0.3)] bg-[rgba(var(--neon-pink-rgb),0.1)] text-[var(--color-neon-pink)]";
  if (source.includes("Batch") || source.includes("deeplearning"))
    return "border-[rgba(var(--neon-purple-rgb),0.3)] bg-[rgba(var(--neon-purple-rgb),0.1)] text-[var(--color-neon-purple)]";
  return "border-[rgba(var(--neon-cyan-rgb),0.2)] bg-[rgba(var(--neon-cyan-rgb),0.06)] text-muted-foreground";
}

/**
 * 每日简报卡片组件 —— 按来源分组展示 RSS 抓取的文章列表。
 *
 * 每个来源显示为一个独立面板，包含来源标签和文章条目列表。
 * 每条文章显示标题、摘要和「新窗口打开」链接图标。
 */
export function BriefingCard({ output }: { output: unknown }) {
  const items = parseBriefing(output);
  if (!items || items.length === 0) return null;

  // 按来源名称分组
  const grouped = items.reduce(
    (acc, item) => {
      const key = item.source;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, BriefingItem[]>,
  );

  return (
    <div className="my-3 space-y-3">
      {Object.entries(grouped).map(([source, items]) => (
        <div
          key={source}
          className="overflow-hidden rounded-xl border border-[rgba(var(--neon-cyan-rgb),0.1)] bg-[var(--th-card-inner-bg)] backdrop-blur-sm"
        >
          {/* 来源标签头部 */}
          <div className="flex items-center gap-2 border-b border-[rgba(var(--neon-cyan-rgb),0.08)] px-4 py-2.5">
            <Rss className="h-3.5 w-3.5 text-[var(--color-neon-cyan)]" style={{ opacity: 0.6 }} />
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${sourceColor(source)}`}
            >
              {source}
            </span>
          </div>
          {/* 文章列表 */}
          <div className="divide-y divide-[rgba(var(--neon-cyan-rgb),0.06)]">
            {items.map((item, i) => (
              <div key={i} className="group px-4 py-3 transition-colors hover:bg-[rgba(var(--neon-cyan-rgb),0.02)]">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium leading-snug">
                    {item.title}
                  </h4>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 shrink-0 text-muted-foreground transition-all hover:text-[var(--color-neon-cyan)] hover:drop-shadow-[0_0_4px_rgba(var(--neon-cyan-rgb),0.4)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {item.snippet && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {item.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
