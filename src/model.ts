import { ChatOpenAI } from "@langchain/openai";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(
      `缺少环境变量 ${name}。\n` +
        `请复制 .env.example 为 .env 并填写你的 API 配置：\n` +
        `  cp .env.example .env\n\n` +
        `支持 OpenAI、Ollama、DeepSeek 等兼容 OpenAI API 的服务。\n` +
        `详见 README.md 中的配置说明。`,
    );
  }
  return v.trim();
}

const baseURL = requireEnv("OPENAI_BASE_URL");
const apiKey = requireEnv("OPENAI_API_KEY");
const modelName = process.env.OPENAI_MODEL?.trim() || "gpt-4o";

/**
 * LLM instance — any OpenAI-compatible endpoint works.
 *
 * Configure via environment variables:
 *   OPENAI_BASE_URL  - API gateway URL
 *   OPENAI_API_KEY   - Auth token
 *   OPENAI_MODEL     - Model name (default: gpt-4o)
 */
export const model = new ChatOpenAI({
  model: modelName,
  apiKey,
  configuration: { baseURL },
  temperature: 0.5,
});
// Some providers (e.g. Bedrock) reject top_p when temperature is set.
// ChatOpenAI sends top_p=1 by default, so we null it out.
(model as any).topP = undefined;
