import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * 旅行规划工具的核心逻辑 —— 将用户的旅行需求结构化。
 *
 * 设计思路：此工具不直接生成行程，而是将用户输入整理成结构化的 JSON，
 * 包含目的地、天数、预算、兴趣和需要生成的内容板块。
 * LLM 收到这个结构化数据后，会结合 web_search 等工具的信息生成最终行程。
 *
 * 这种「工具收集参数 → LLM 生成内容」的模式比让工具直接生成行程更灵活，
 * 因为 LLM 可以根据上下文调整输出格式和详细程度。
 */
async function planTravel(params: {
  destination: string;
  days: number;
  budget?: string;
  interests?: string[];
  startDate?: string;
}): Promise<string> {
  const { destination, days, budget, interests, startDate } = params;

  const travelRequest = {
    destination,
    duration: `${days} 天`,
    budget: budget ?? "不限",
    interests: interests?.length ? interests : ["观光", "美食", "文化"],
    startDate: startDate ?? "灵活",
    requestedSections: [
      "每日行程安排（景点 + 交通方式 + 预计时间）",
      "住宿推荐（按预算分档）",
      "当地美食推荐",
      "预算估算明细",
      "注意事项和旅行小贴士",
    ],
  };

  return JSON.stringify(travelRequest, null, 2);
}

/**
 * 旅游规划工具 —— LangChain Tool 定义。
 * 收集旅行参数并输出结构化需求，配合 web_search 可获取更精准的实时信息。
 */
export const travelPlannerTool = tool(
  async (params) => planTravel(params),
  {
    name: "plan_travel",
    description:
      "旅游规划助手。根据目的地、天数、预算和兴趣生成结构化旅行需求。会输出详细的每日行程、住宿推荐、美食推荐和预算估算。建议配合 web_search 获取最新旅游信息。",
    schema: z.object({
      destination: z.string().describe("旅行目的地，如：京都、巴厘岛、瑞士"),
      days: z.number().min(1).max(30).describe("旅行天数"),
      budget: z
        .string()
        .optional()
        .describe("预算范围，如：3000元、$1000、不限"),
      interests: z
        .array(z.string())
        .optional()
        .describe(
          "兴趣标签，如：[\"美食\", \"历史\", \"自然\", \"购物\", \"摄影\"]",
        ),
      startDate: z
        .string()
        .optional()
        .describe("出发日期，如：2026-05-01"),
    }),
  },
);
