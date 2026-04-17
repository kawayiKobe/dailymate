import "dotenv/config";
import {
  HumanMessage,
  ToolMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import type { AIMessage } from "@langchain/core/messages";
import { model } from "../src/model.js";

/**
 * 天气查询函数 —— 使用 wttr.in 免费 API，无需 API Key。
 */
async function getWeather(city: string): Promise<string> {
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
  console.log(`\n🔧 [Tool] 正在查询 ${city} 的天气...\n`);

  const res = await fetch(url, {
    headers: { "User-Agent": "langchain-weather-demo" },
  });

  if (!res.ok) {
    return `无法获取 ${city} 的天气信息（HTTP ${res.status}）`;
  }

  const data = await res.json();
  const current = data.current_condition?.[0];
  if (!current) return `未找到 ${city} 的天气数据`;

  const desc =
    current.lang_zh?.[0]?.value ??
    current.weatherDesc?.[0]?.value ??
    "未知";

  return JSON.stringify({
    city,
    temperature: `${current.temp_C}°C / ${current.temp_F}°F`,
    feelsLike: `${current.FeelsLikeC}°C`,
    weather: desc,
    humidity: `${current.humidity}%`,
    windSpeed: `${current.windspeedKmph} km/h`,
    windDirection: current.winddir16Point,
    visibility: `${current.visibility} km`,
    uvIndex: current.uvIndex,
  });
}

/** OpenAI function-calling 格式的工具定义 */
const toolDefs = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description:
        "查询指定城市的实时天气信息，包括温度、湿度、风速、天气状况等",
      parameters: {
        type: "object" as const,
        properties: {
          city: {
            type: "string" as const,
            description:
              "城市名称，例如：Beijing、Shanghai、Tokyo、New York",
          },
        },
        required: ["city"],
      },
    },
  },
];

const llmWithTools = model.bindTools(toolDefs);

const SYSTEM_PROMPT =
  "你是一个天气助手，可以查询全球任意城市的实时天气。" +
  "请用中文回复用户，将天气数据整理成易读的格式。" +
  "如果用户没有指定城市，请友好地询问。";

/**
 * Agent 循环：发送消息 → 模型调用工具 → 执行 → 返回结果 → 最终回复
 */
async function agentRun(userInput: string): Promise<string> {
  const messages: BaseMessage[] = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userInput),
  ];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = (await llmWithTools.invoke(messages)) as AIMessage;
    messages.push(response);

    const toolCalls = response.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      return typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    }

    for (const tc of toolCalls) {
      let result: string;
      if (tc.name === "get_weather") {
        result = await getWeather(tc.args.city);
      } else {
        result = `未知工具: ${tc.name}`;
      }

      messages.push(
        new ToolMessage({ tool_call_id: tc.id!, content: result }),
      );
    }
  }
}

async function main() {
  console.log("=== 天气查询 Agent Demo ===\n");

  const questions = [
    "今天北京天气怎么样？",
    "帮我对比一下上海和东京的天气",
    "纽约现在适合户外活动吗？",
  ];

  for (const q of questions) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`[用户] ${q}`);
    console.log("=".repeat(50));

    const answer = await agentRun(q);
    console.log(`\n[AI] ${answer}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
