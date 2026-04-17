import "dotenv/config";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { agent } from "@/src/lib/agent";

/**
 * POST /api/chat —— 聊天接口，前端通过 useChat() Hook 调用。
 *
 * 流程：
 * 1. 从请求体解析 messages（前端 UI 格式）和可选的会话 id
 * 2. 将 UI 消息转换为 LangChain 格式
 * 3. 调用 LangGraph agent 以流式模式运行（同时获取中间状态和逐 token 输出）
 * 4. 将 LangChain 流转换回 UI 消息流，返回 SSE 响应给前端
 */
export async function POST(req: Request) {
  const { messages, id } = (await req.json()) as {
    messages: UIMessage[];
    id?: string;
  };

  // 将前端 UIMessage[] 转成 LangChain 的 BaseMessage[]
  const langchainMessages = await toBaseMessages(messages);

  // 以流式模式调用 agent；thread_id 用于 MemorySaver 区分不同会话的上下文
  const stream = await agent.stream(
    { messages: langchainMessages },
    {
      configurable: { thread_id: id ?? "web-default" },
      // "values" 返回状态快照（含工具调用中间结果），"messages" 返回逐 token 文本
      streamMode: ["values", "messages"] as const,
    },
  );

  // 将 LangChain 流适配为前端 useChat() 可消费的 UI 消息流（SSE 格式）
  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
