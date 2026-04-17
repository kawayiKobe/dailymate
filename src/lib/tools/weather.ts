import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * 调用 wttr.in 天气 API（免费无需密钥）获取指定城市的实时天气。
 * 返回结构化 JSON 供前端 WeatherCard 组件渲染。
 */
async function fetchWeather(city: string): Promise<string> {
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "dailymate-agent" },
  });

  if (!res.ok) {
    return `无法获取 ${city} 的天气信息（HTTP ${res.status}）`;
  }

  const data: any = await res.json();
  const current = data.current_condition?.[0];
  if (!current) return `未找到 ${city} 的天气数据`;

  // 优先使用中文天气描述，回退到英文
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

/**
 * 天气查询工具 —— LangChain Tool 定义。
 * 查询指定城市的实时天气，支持中英文城市名。
 */
export const weatherTool = tool(
  async ({ city }) => fetchWeather(city),
  {
    name: "get_weather",
    description:
      "查询指定城市的实时天气信息，包括温度、体感温度、湿度、风速、天气状况、紫外线指数等。城市名支持中英文。",
    schema: z.object({
      city: z
        .string()
        .describe("城市名称，例如：Beijing、Shanghai、Tokyo、New York"),
    }),
  },
);
