import "dotenv/config";
import { ConversationSummaryMemory } from "@langchain/classic/memory";
import { ConversationChain } from "@langchain/classic/chains";
import { model } from "../src/model.js";

/**
 * ConversationSummaryMemory：用 LLM 将历史对话压缩为摘要，而非保留原始消息。
 * 适合长对话场景——token 用量不会随对话轮次线性增长。
 */
async function main() {
  const memory = new ConversationSummaryMemory({
    llm: model,
  });

  const chain = new ConversationChain({
    llm: model,
    memory,
    verbose: true,
  });

  console.log("=== ConversationSummaryMemory Demo ===\n");

  const conversations = [
    "我叫小红，是一名后端工程师，主要用 Go 和 Python。",
    "我们团队最近在做微服务架构重构，把单体应用拆成了 12 个服务。",
    "遇到的主要问题是服务间通信延迟高，以及分布式事务一致性。",
    "我们考虑用 gRPC 替换 HTTP REST，用 Saga 模式处理分布式事务。",
    "请帮我总结一下我们聊过的所有内容，包括我的背景和技术方案。",
  ];

  for (const input of conversations) {
    console.log(`[用户] ${input}`);
    const result = await chain.call({ input });
    console.log(`[AI]   ${result.response}\n`);
  }

  console.log("--- 当前 Summary 内容 ---");
  const memoryVars = await memory.loadMemoryVariables({});
  console.log(memoryVars.history);
  console.log(
    "\n(注意：相比 BufferMemory 的完整历史，这里只有精炼的摘要)"
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
