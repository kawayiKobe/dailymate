import { OpenAIEmbeddings } from "@langchain/openai";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(`缺少环境变量 ${name}，请复制 .env.example 为 .env 并填写`);
  }
  return v.trim();
}

const baseURL = requireEnv("OPENAI_BASE_URL");
const apiKey = requireEnv("OPENAI_API_KEY");
const embeddingModel =
  process.env.EMBEDDING_MODEL?.trim() || "text-embedding-3-small";

/**
 * OpenAI 兼容网关的文本嵌入模型。
 * 如需更换模型，设置环境变量 EMBEDDING_MODEL。
 */
export const embeddings = new OpenAIEmbeddings({
  model: embeddingModel,
  apiKey,
  configuration: { baseURL },
});
