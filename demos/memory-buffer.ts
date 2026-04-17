import "dotenv/config";
import { BufferMemory } from "@langchain/classic/memory";
import { ConversationChain } from "@langchain/classic/chains";
import { model } from "../src/model.js";

/**
 * BufferMemory：最简单的记忆模式，将所有历史消息原封不动存入上下文。
 * 适合短对话场景，超长对话会导致 token 超限。
 */
async function main() {
  const memory = new BufferMemory();

  const chain = new ConversationChain({
    llm: model,
    memory,
    verbose: true,
  });

  console.log("=== BufferMemory Demo ===\n");

  const q1 = "我叫小明，今年25岁，是一名前端工程师。";
  console.log(`[用户] ${q1}`);
  const r1 = await chain.call({ input: q1 });
  console.log(`[AI]   ${r1.response}\n`);

  const q2 = "我最近在学习 LangChain，你能帮我总结一下它的核心概念吗？";
  console.log(`[用户] ${q2}`);
  const r2 = await chain.call({ input: q2 });
  console.log(`[AI]   ${r2.response}\n`);

  const q3 = "你还记得我叫什么名字吗？我是做什么工作的？";
  console.log(`[用户] ${q3}`);
  const r3 = await chain.call({ input: q3 });
  console.log(`[AI]   ${r3.response}\n`);

  console.log("--- 当前 Memory 内容 ---");
  const memoryVars = await memory.loadMemoryVariables({});
  console.log(memoryVars.history);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
