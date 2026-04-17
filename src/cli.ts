/**
 * CLI 入口 —— 在终端中运行 DailyMate 的交互式对话界面。
 *
 * 用法：npx tsx src/cli.ts
 *
 * 功能：
 * - 逐行读取用户输入，调用 LangGraph agent 获取流式回复
 * - 实时逐字输出 AI 回复（打字机效果）
 * - 输入 "exit" 或 "退出" 结束对话
 */
import "dotenv/config";
import * as readline from "node:readline";
import { HumanMessage } from "@langchain/core/messages";
import { agent } from "./lib/agent";

// 创建 readline 接口，用于终端中逐行读取用户输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/** 将 readline.question 包装为 Promise，便于 async/await 使用 */
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

// 会话 ID：用于 MemorySaver 区分不同对话的上下文记忆
const threadId = `cli-${Date.now()}`;

// 启动时的欢迎横幅
console.log("╔══════════════════════════════════════╗");
console.log("║     🤖 DailyMate · 个人超级助手      ║");
console.log("╠══════════════════════════════════════╣");
console.log("║  试试问我：                           ║");
console.log("║  · 今天有什么前端新闻？               ║");
console.log("║  · 北京天气怎么样？                   ║");
console.log("║  · 帮我规划一个 5 天京都旅行          ║");
console.log("║  · 2026 年有哪些假期可以拼假？        ║");
console.log("║  输入 exit 退出                       ║");
console.log("╚══════════════════════════════════════╝\n");

/**
 * 发送一条用户消息并流式打印 AI 回复。
 *
 * 使用 agent.stream() 以 "messages" 模式获取流，
 * 逐 chunk 检查：AI 文本片段直接输出，工具调用完成时打印提示。
 */
async function chat(userInput: string): Promise<void> {
  process.stdout.write("\n🤖 ");

  const stream = await agent.stream(
    { messages: [new HumanMessage(userInput)] },
    {
      configurable: { thread_id: threadId },
      streamMode: "messages",
    },
  );

  for await (const [message, _metadata] of stream) {
    // AI 的文本回复：逐字输出到终端
    if (
      message._getType() === "ai" &&
      typeof message.content === "string" &&
      message.content
    ) {
      process.stdout.write(message.content);
    }
    // 工具调用完成的通知
    if (message._getType() === "tool") {
      process.stdout.write("\n  📎 [工具调用完成]\n");
    }
  }

  console.log("\n");
}

// 主循环：不断读取用户输入，直到输入 exit 或 退出
// eslint-disable-next-line no-constant-condition
while (true) {
  const input = await prompt("👤 你: ");
  const trimmed = input.trim();

  if (!trimmed) continue;
  if (trimmed.toLowerCase() === "exit" || trimmed === "退出") {
    console.log("👋 再见！");
    rl.close();
    break;
  }

  try {
    await chat(trimmed);
  } catch (err: any) {
    console.error(`\n❌ 错误: ${err.message}\n`);
  }
}
