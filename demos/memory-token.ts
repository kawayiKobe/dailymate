import "dotenv/config";
import { ConversationTokenBufferMemory } from "@langchain/classic/memory";
import { ConversationChain } from "@langchain/classic/chains";
import { model } from "../src/model.js";

/**
 * ConversationTokenBufferMemory：按 token 总量限制记忆。
 * 当历史消息的 token 数超过 maxTokenLimit，自动从最早的消息开始丢弃。
 * 比轮数限制更精细——短消息可以多存几轮，长消息自动少存。
 */
async function main() {
  const memory = new ConversationTokenBufferMemory({
    llm: model,
    maxTokenLimit: 200,
  });

  const chain = new ConversationChain({
    llm: model,
    memory,
    verbose: false,
  });

  console.log(
    "=== ConversationTokenBufferMemory Demo (maxTokenLimit=200) ===\n"
  );

  const questions = [
    "我叫小明，今年25岁，是一名前端工程师。",
    "我擅长 React、TypeScript、Next.js，也了解 Vue 和 Svelte。",
    "我最近在学习 LangChain 的记忆系统，觉得非常有趣。",
    "你还记得我叫什么名字吗？我擅长哪些技术？",
  ];

  for (let i = 0; i < questions.length; i++) {
    const input = questions[i];
    console.log(`[第${i + 1}轮 - 用户] ${input}`);
    const result = await chain.call({ input });
    console.log(`[第${i + 1}轮 - AI]   ${result.response}\n`);

    const vars = await memory.loadMemoryVariables({});
    const history = vars.history as string;
    const lines = history.split("\n").filter(Boolean);
    const approxTokens = Math.ceil(history.length / 4);
    console.log(
      `  📦 Memory: ~${approxTokens} tokens (约), ${lines.length / 2} 轮对话`
    );
    console.log(`  ---`);
    for (const line of lines) {
      console.log(`  ${line.length > 80 ? line.slice(0, 80) + "..." : line}`);
    }
    console.log();
  }

  console.log("=== 结论 ===");
  console.log("token 限制为 200，当累计 token 超限时，最早的对话被自动丢弃。");
  console.log("相比轮数限制，token 限制更精细：短消息可以多存几轮，长消息自动少存。");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
