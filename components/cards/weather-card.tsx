"use client";

import {
  Droplets,
  Wind,
  Eye,
  Sun,
  CloudSun,
} from "lucide-react";

/** 天气工具返回的数据结构 */
interface WeatherData {
  city: string;
  temperature: string;   // 格式 "25°C / 77°F"
  feelsLike: string;
  weather: string;        // 天气描述（如"晴"、"多云"）
  humidity: string;
  windSpeed: string;
  windDirection: string;
  visibility: string;
  uvIndex: string;
}

/** 安全解析工具输出：可能是 JSON 字符串或已解析的对象 */
function parseWeather(output: unknown): WeatherData | null {
  try {
    if (typeof output === "string") return JSON.parse(output);
    return output as WeatherData;
  } catch {
    return null;
  }
}

/** 根据紫外线指数返回等级文本和对应颜色 */
function uvLevel(idx: string): { text: string; color: string } {
  const n = Number.parseInt(idx, 10);
  if (n <= 2) return { text: "低", color: "text-[var(--color-neon-cyan)]" };
  if (n <= 5) return { text: "中等", color: "text-amber-400" };
  if (n <= 7) return { text: "高", color: "text-orange-400" };
  return { text: "极高", color: "text-[var(--color-neon-pink)]" };
}

/**
 * 天气卡片组件 —— 可视化展示天气工具的返回结果。
 *
 * 布局：
 * - 上方：城市名 + 天气描述 + 天气图标
 * - 中间：大号温度数字 + 体感温度
 * - 下方：4 列统计指标（湿度/风速/能见度/紫外线）
 */
export function WeatherCard({ output }: { output: unknown }) {
  const data = parseWeather(output);
  if (!data) return null;

  const uv = uvLevel(data.uvIndex);

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[rgba(var(--neon-blue-rgb),0.2)] bg-gradient-to-br from-[rgba(var(--neon-blue-rgb),0.06)] to-[rgba(var(--neon-cyan-rgb),0.03)] shadow-[0_0_20px_rgba(var(--neon-blue-rgb),0.06)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wider">{data.city}</h3>
          <p className="text-xs text-muted-foreground">{data.weather}</p>
        </div>
        <CloudSun className="h-10 w-10 text-[var(--color-neon-blue)] opacity-60" style={{ filter: "drop-shadow(0 0 8px rgba(var(--neon-blue-rgb),0.4))" }} />
      </div>

      <div className="px-4 pb-2">
        {/* 只显示摄氏温度部分（"25°C / 77°F" → "25°C"） */}
        <span className="text-4xl font-bold tracking-tighter glow-text" style={{ textShadow: "0 0 15px rgba(var(--neon-blue-rgb),0.4), 0 0 30px rgba(var(--neon-blue-rgb),0.15)" }}>
          {data.temperature.split("/")[0]?.trim()}
        </span>
        <span className="ml-2 text-sm text-muted-foreground">
          体感 {data.feelsLike}
        </span>
      </div>

      {/* 底部 4 列指标 */}
      <div className="grid grid-cols-4 gap-px border-t border-[rgba(var(--neon-blue-rgb),0.12)] bg-[rgba(var(--neon-blue-rgb),0.06)]">
        <Stat icon={Droplets} label="湿度" value={data.humidity} />
        <Stat
          icon={Wind}
          label="风速"
          value={`${data.windSpeed}`}
          sub={data.windDirection}
        />
        <Stat icon={Eye} label="能见度" value={data.visibility} />
        <Stat
          icon={Sun}
          label="紫外线"
          value={`${data.uvIndex}`}
          sub={uv.text}
          valueColor={uv.color}
        />
      </div>
    </div>
  );
}

/** 单个指标列（图标 + 标签 + 数值 + 可选副文本） */
function Stat({
  icon: Icon,
  label,
  value,
  sub,
  valueColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[var(--th-card-inner-bg)] px-2 py-3 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-[var(--color-neon-blue)] opacity-60" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold ${valueColor ?? ""}`}>
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}
