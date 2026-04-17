import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { SystemMessage } from "@langchain/core/messages";
import { model } from "../model";
import {
  weatherTool,
  webSearchTool,
  dailyBriefingTool,
  holidayTool,
  travelPlannerTool,
  getPreferencesTool,
  savePreferencesTool,
} from "./tools";

/**
 * 系统提示词 —— 定义 AI 助手的角色、能力范围和行为规范。
 *
 * 包含：
 * - 功能说明（简报/天气/旅游/假期/搜索/偏好记忆）
 * - 回复语言和风格要求
 * - 工具组合使用策略
 * - 偏好记忆的读取和保存时机
 * - 动态注入当天日期（用于时效性判断）
 */
const SYSTEM_PROMPT = `你是 DailyMate —— 一个全能的个人超级助手。你能帮助用户：

1. **每日简报**：获取前端开发、人工智能领域的最新资讯，用简洁的中文总结要点
2. **天气查询**：查询全球任意城市的实时天气
3. **旅游规划**：根据目的地、天数、预算和兴趣生成详细的旅行计划
4. **假期规划**：查询各国法定假日，提供拼假攻略
5. **网络搜索**：搜索互联网获取实时信息
6. **记忆偏好**：记住用户的常住城市、兴趣、旅行风格等偏好

## 行为准则
- 始终用中文回复，语气亲切自然
- 主动组合多个工具完成复杂任务（如旅游规划时同时查天气、搜索攻略、查假期）
- 将工具返回的原始数据整理成易读的格式，善用 Markdown 排版
- 对于简报类内容，提炼关键信息并附上原文链接
- 如果信息不足，主动追问用户偏好
- 如果你不确定某个信息，请直接说"我没有关于这个问题的可靠信息"，不要猜测或编造答案。不确定 ≠ 失败，诚实才是好助手

## 偏好记忆
- 对话开始时，可以先调用 get_preferences 查看用户是否有已保存的偏好
- 当用户提到"我住在北京"、"我喜欢摄影"、"我是做前端的"等信息时，使用 save_preferences 自动保存
- 利用已知偏好提供个性化服务（如用户说"今天天气如何"时直接查询其常住城市）

今天是 ${new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}。`;

/** 注册给 Agent 的所有工具列表 */
const tools = [
  weatherTool,
  webSearchTool,
  dailyBriefingTool,
  holidayTool,
  travelPlannerTool,
  getPreferencesTool,
  savePreferencesTool,
];

/**
 * MemorySaver —— 基于内存的对话历史存储（开发用）。
 * 生产环境应替换为持久化存储（如 Redis、PostgreSQL）。
 */
const checkpointer = new MemorySaver();

/**
 * 创建 LangGraph ReAct Agent。
 *
 * ReAct 模式：LLM 先「推理」（Reason）要调用哪些工具，再「行动」（Act）调用工具，
 * 循环直到任务完成。LangGraph 负责编排这个循环。
 *
 * - llm: 底层大语言模型（通过 OpenAI 兼容接口调用）
 * - tools: 可用工具集合
 * - prompt: 系统提示词，定义助手行为
 * - checkpointer: 会话记忆存储，使多轮对话具有上下文
 */
export const agent = createReactAgent({
  llm: model,
  tools,
  prompt: new SystemMessage(SYSTEM_PROMPT),
  checkpointer,
});

export { tools };
