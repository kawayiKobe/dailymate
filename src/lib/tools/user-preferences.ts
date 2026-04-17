import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

/** 偏好文件存储路径：项目根目录下的 .data/preferences.json */
const PREFS_PATH = join(process.cwd(), ".data", "preferences.json");

/** 用户偏好数据结构 */
interface UserPreferences {
  city?: string;                                    // 常住城市
  country?: string;                                 // 所在国家
  interests?: string[];                             // 兴趣标签
  briefingCategory?: "frontend" | "ai" | "all";     // 简报偏好类别
  travelStyle?: string;                             // 旅行风格
  notes?: string[];                                 // 其他备注
}

/** 从文件加载偏好，文件不存在时返回空对象 */
async function loadPrefs(): Promise<UserPreferences> {
  try {
    const raw = await readFile(PREFS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** 将偏好写入文件，自动创建 .data 目录 */
async function savePrefs(prefs: UserPreferences): Promise<void> {
  await mkdir(dirname(PREFS_PATH), { recursive: true });
  await writeFile(PREFS_PATH, JSON.stringify(prefs, null, 2), "utf-8");
}

/**
 * 读取偏好工具 —— 读取用户已保存的个人偏好。
 * 在对话开始时调用，以便 LLM 提供个性化服务（如自动查询常住城市天气）。
 */
export const getPreferencesTool = tool(
  async () => {
    const prefs = await loadPrefs();
    if (Object.keys(prefs).length === 0) {
      return "用户尚未设置任何偏好。你可以在对话中主动了解用户偏好并使用 save_preferences 保存。";
    }
    return JSON.stringify(prefs, null, 2);
  },
  {
    name: "get_preferences",
    description:
      "读取用户的个人偏好设置，包括常住城市、所在国家、兴趣标签、简报偏好、旅行风格等。在对话开始时或需要个性化推荐时调用。",
    schema: z.object({}),
  },
);

/**
 * 保存偏好工具 —— 增量更新用户偏好。
 *
 * 合并策略：
 * - 普通字段（city, country 等）：直接覆盖
 * - interests: 合并去重（追加新兴趣而不丢失旧的）
 * - notes: 追加模式（新备注添加到列表末尾）
 */
export const savePreferencesTool = tool(
  async (params) => {
    const current = await loadPrefs();
    const updates: Partial<UserPreferences> = {};

    if (params.city) updates.city = params.city;
    if (params.country) updates.country = params.country;
    if (params.interests?.length) {
      // 合并去重：保留旧兴趣 + 添加新兴趣
      updates.interests = [
        ...new Set([...(current.interests ?? []), ...params.interests]),
      ];
    }
    if (params.briefingCategory)
      updates.briefingCategory = params.briefingCategory;
    if (params.travelStyle) updates.travelStyle = params.travelStyle;
    if (params.note) {
      updates.notes = [...(current.notes ?? []), params.note];
    }

    const merged = { ...current, ...updates };
    await savePrefs(merged);

    return `偏好已保存: ${JSON.stringify(updates)}`;
  },
  {
    name: "save_preferences",
    description:
      "保存或更新用户的个人偏好。当用户提到自己的常住城市、兴趣爱好、旅行风格等信息时自动调用保存。",
    schema: z.object({
      city: z.string().optional().describe("用户常住城市"),
      country: z.string().optional().describe("用户所在国家，如 CN、US、JP"),
      interests: z
        .array(z.string())
        .optional()
        .describe("兴趣标签列表，如 ['前端', 'AI', '摄影']"),
      briefingCategory: z
        .enum(["frontend", "ai", "all"])
        .optional()
        .describe("简报偏好类别"),
      travelStyle: z
        .string()
        .optional()
        .describe("旅行风格，如 '背包客'、'亲子游'、'奢华游'"),
      note: z.string().optional().describe("其他备注信息"),
    }),
  },
);
