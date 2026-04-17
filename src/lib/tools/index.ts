/**
 * 工具统一导出 —— 汇总所有 Agent 可用的工具。
 * 新增工具时在对应文件中实现，然后在此处添加 export。
 */
export { weatherTool } from "./weather";
export { webSearchTool } from "./web-search";
export { dailyBriefingTool } from "./daily-briefing";
export { holidayTool } from "./holiday";
export { travelPlannerTool } from "./travel-planner";
export { getPreferencesTool, savePreferencesTool } from "./user-preferences";
