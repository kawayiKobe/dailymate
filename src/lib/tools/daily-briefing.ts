import { tool } from "@langchain/core/tools";
import { z } from "zod";
import RSSParser from "rss-parser";

const parser = new RSSParser();

interface FeedSource {
  name: string;
  url: string;
  category: "frontend" | "ai" | "tech";
}

/**
 * RSS 订阅源列表 —— 每日简报的数据来源。
 * 按类别分为 frontend（前端）、ai（人工智能）和 tech（综合科技）。
 */
const FEED_SOURCES: FeedSource[] = [
  // 前端
  {
    name: "Hacker News (Best)",
    url: "https://hnrss.org/best?count=10",
    category: "tech",
  },
  {
    name: "JavaScript Weekly",
    url: "https://javascriptweekly.com/rss",
    category: "frontend",
  },
  {
    name: "CSS-Tricks",
    url: "https://css-tricks.com/feed/",
    category: "frontend",
  },
  // AI
  {
    name: "MIT Technology Review - AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    category: "ai",
  },
  // 中文科技媒体
  {
    name: "36氪",
    url: "https://www.36kr.com/feed",
    category: "tech",
  },
  {
    name: "虎嗅",
    url: "https://rss.huxiu.com/",
    category: "tech",
  },
  {
    name: "IT之家",
    url: "http://www.ithome.com/rss/",
    category: "tech",
  },
];

/** 解析后的单条 RSS 条目 */
interface FeedItem {
  source: string;
  title: string;
  link: string;
  date: string;
  snippet: string;
}

/**
 * 从单个 RSS 源抓取最新条目（最多 5 条）。
 * 如果抓取失败，返回一条错误占位条目而非抛出异常，确保不影响其他源。
 */
async function fetchFeed(source: FeedSource): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items ?? []).slice(0, 5).map((item) => ({
      source: source.name,
      title: item.title ?? "(no title)",
      link: item.link ?? "",
      date: item.pubDate ?? item.isoDate ?? "",
      snippet: (item.contentSnippet ?? item.content ?? "").slice(0, 200),
    }));
  } catch {
    return [
      {
        source: source.name,
        title: `[抓取失败] ${source.name}`,
        link: "",
        date: "",
        snippet: "RSS 源暂时不可用",
      },
    ];
  }
}

/**
 * 获取每日简报：根据类别筛选 RSS 源，并行抓取所有源的最新条目。
 * 返回 JSON 字符串供 LLM 整理成可读格式。
 */
async function getDailyBriefing(
  category: "frontend" | "ai" | "all",
): Promise<string> {
  const sources =
    category === "all"
      ? FEED_SOURCES
      : FEED_SOURCES.filter(
          (s) => s.category === category || s.category === "tech",
        );

  // 并行抓取所有源，提升速度
  const results = await Promise.all(sources.map(fetchFeed));
  const allItems = results.flat();

  if (allItems.length === 0) {
    return "暂时无法获取简报内容，请稍后再试。";
  }

  return JSON.stringify(allItems, null, 2);
}

/**
 * 每日简报工具 —— LangChain Tool 定义。
 *
 * schema 使用 Zod 定义输入参数，LLM 会根据 description 决定何时调用此工具。
 */
export const dailyBriefingTool = tool(
  async ({ category }) => getDailyBriefing(category),
  {
    name: "get_daily_briefing",
    description:
      "获取每日技术简报，包括前端开发和人工智能领域的最新文章和新闻。从多个 RSS 源抓取内容，返回标题、链接和摘要。可按类别筛选。",
    schema: z.object({
      category: z
        .enum(["frontend", "ai", "all"])
        .default("all")
        .describe("简报类别：frontend(前端)、ai(人工智能)、all(全部)"),
    }),
  },
);
