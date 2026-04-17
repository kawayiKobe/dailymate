import "dotenv/config";
import { BufferWindowMemory } from "@langchain/classic/memory";
import { ConversationChain } from "@langchain/classic/chains";
import { model } from "../src/model.js";

/**
 * BufferWindowMemory：只保留最近 k 轮对话，更早的消息自动丢弃。
 * 适合不需要完整历史、只关注近期上下文的场景。
 */
async function main() {
  const memory = new BufferWindowMemory({ k: 2 });

  const chain = new ConversationChain({
    llm: model,
    memory,
    verbose: false,
  });

  console.log("=== BufferWindowMemory Demo (k=2, 只保留最近 2 轮) ===\n");

  const questions = [
    "我叫小明，今年25岁。",
    "我是一名前端工程师，擅长 React 和 TypeScript。",
    "我最近在学习 LangChain。",
    "你还记得我叫什么名字吗？多大了？",
  ];

  for (let i = 0; i < questions.length; i++) {
    const input = questions[i];
    console.log(`[第${i + 1}轮 - 用户] ${input}`);
    const result = await chain.call({ input });
    console.log(`[第${i + 1}轮 - AI]   ${result.response}\n`);

    const vars = await memory.loadMemoryVariables({});
    const lines = (vars.history as string).split("\n").filter(Boolean);
    console.log(`  📦 Memory 中保留了 ${lines.length / 2} 轮对话`);
    console.log(`  ---`);
    for (const line of lines) {
      console.log(`  ${line}`);
    }
    console.log();
  }

  console.log("=== 结论 ===");
  console.log("第1轮的信息（名字、年龄）在第4轮时已被窗口滑出，AI 无法记住。");
  console.log("第2轮（职业）和第3轮（学习LangChain）仍在窗口内。");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
