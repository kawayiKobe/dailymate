import { tool } from "@langchain/core/tools";
import { z } from "zod";

interface Holiday {
  name: string;
  date: string;
  type: string;
}

/**
 * 调用 Nager.Date 公共假期 API（https://date.nager.at，免费无需密钥）。
 * 返回指定国家和年份的法定公共假期列表。
 */
async function fetchPublicHolidays(
  countryCode: string,
  year: number,
): Promise<Holiday[]> {
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`获取假期数据失败（HTTP ${res.status}）`);
  }
  const data = (await res.json()) as any[];
  return data.map((h) => ({
    name: h.localName || h.name,
    date: h.date,
    type: h.types?.[0] ?? "Public",
  }));
}

/**
 * 中国假期硬编码数据 —— 包含调休安排。
 *
 * 原因：目前没有免费 API 能可靠地提供中国的调休假期信息，
 * 所以 2025/2026 年的数据手动维护。日期格式支持区间（如 "2026-02-17~02-23"）。
 */
const CHINA_HOLIDAYS: Record<number, Holiday[]> = {
  2025: [
    { name: "元旦", date: "2025-01-01", type: "Public" },
    { name: "春节", date: "2025-01-28~02-04", type: "Public" },
    { name: "清明节", date: "2025-04-04~04-06", type: "Public" },
    { name: "劳动节", date: "2025-05-01~05-05", type: "Public" },
    { name: "端午节", date: "2025-05-31~06-02", type: "Public" },
    { name: "中秋节+国庆节", date: "2025-10-01~10-08", type: "Public" },
  ],
  2026: [
    { name: "元旦", date: "2026-01-01~01-03", type: "Public" },
    { name: "春节", date: "2026-02-17~02-23", type: "Public" },
    { name: "清明节", date: "2026-04-04~04-06", type: "Public" },
    { name: "劳动节", date: "2026-05-01~05-05", type: "Public" },
    { name: "端午节", date: "2026-06-19~06-21", type: "Public" },
    { name: "中秋节", date: "2026-09-25~09-27", type: "Public" },
    { name: "国庆节", date: "2026-10-01~10-07", type: "Public" },
  ],
};

/**
 * 查询假期的核心逻辑：
 * - 中国（CN/CHINA/中国）：使用本地硬编码数据（含调休）
 * - 其他国家：调用 Nager.Date API
 */
async function getHolidays(
  country: string,
  year: number,
): Promise<string> {
  const code = country.toUpperCase();

  // 中国特殊处理：使用本地数据
  if (code === "CN" || code === "CHINA" || code === "中国") {
    const holidays = CHINA_HOLIDAYS[year];
    if (holidays) {
      return JSON.stringify({ country: "中国", year, holidays }, null, 2);
    }
    return JSON.stringify({
      country: "中国",
      year,
      holidays: [],
      note: `暂无 ${year} 年中国假期数据，请查询 2025 或 2026 年`,
    });
  }

  // 其他国家：调用外部 API
  try {
    const holidays = await fetchPublicHolidays(code, year);
    return JSON.stringify({ country: code, year, holidays }, null, 2);
  } catch (err: any) {
    return JSON.stringify({
      error: err.message,
      note: "请使用 ISO 3166-1 两位国家代码，如 US、JP、DE、CN",
    });
  }
}

/**
 * 假期查询工具 —— LangChain Tool 定义。
 * 支持中国（含调休安排）和全球 100+ 国家的法定节假日查询。
 */
export const holidayTool = tool(
  async ({ country, year }) => getHolidays(country, year),
  {
    name: "get_holidays",
    description:
      "查询指定国家和年份的法定节假日信息。支持中国（含调休安排）和全球 100+ 国家。可用于假期规划和拼假攻略。",
    schema: z.object({
      country: z
        .string()
        .describe(
          "国家代码或名称，如 CN(中国)、US(美国)、JP(日本)、DE(德国)",
        ),
      year: z
        .number()
        .default(2026)
        .describe("年份，默认当前年份"),
    }),
  },
);
