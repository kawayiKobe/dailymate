import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as cheerio from "cheerio";

/**
 * 通过 DuckDuckGo HTML 搜索页面抓取搜索结果（无需 API Key）。
 *
 * 原理：请求 DuckDuckGo 的 HTML 版本搜索页面，用 cheerio 解析 DOM 提取结果。
 * 注意：高频调用可能被限流，需做好降级处理。
 */
async function duckDuckGoSearch(
  query: string,
  maxResults = 5,
): Promise<string> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    return `搜索失败（HTTP ${res.status}）`;
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // 从搜索结果 DOM 中提取标题、链接和摘要
  const results: { title: string; url: string; snippet: string }[] = [];
  $(".result").each((i, el) => {
    if (i >= maxResults) return false;
    const title = $(el).find(".result__title").text().trim();
    const link = $(el).find(".result__url").text().trim();
    const snippet = $(el).find(".result__snippet").text().trim();
    if (title) {
      results.push({
        title,
        url: link.startsWith("http") ? link : `https://${link}`,
        snippet,
      });
    }
  });

  if (results.length === 0) {
    return `未找到关于「${query}」的搜索结果`;
  }

  return JSON.stringify(results, null, 2);
}

/**
 * 网络搜索工具 —— LangChain Tool 定义。
 * 通过 DuckDuckGo 搜索互联网获取实时信息。
 */
export const webSearchTool = tool(
  async ({ query, maxResults }) => duckDuckGoSearch(query, maxResults),
  {
    name: "web_search",
    description:
      "搜索互联网获取实时信息。适用于查找最新新闻、技术文档、旅游攻略、价格比较等需要实时数据的场景。",
    schema: z.object({
      query: z.string().describe("搜索关键词"),
      maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("返回结果数量，默认 5"),
    }),
  },
);
