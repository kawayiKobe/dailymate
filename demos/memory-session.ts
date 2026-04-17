import "dotenv/config";
import {
  RunnableWithMessageHistory,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/classic/stores/message/in_memory";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { model } from "../src/model.js";

/**
 * RunnableWithMessageHistory：LangChain 推荐的新版记忆方案。
 * 核心优势：支持多会话隔离——不同 sessionId 维护独立的对话历史。
 */

const sessionStore = new Map<string, ChatMessageHistory>();

function getSessionHistory(sessionId: string): ChatMessageHistory {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, new ChatMessageHistory());
  }
  return sessionStore.get(sessionId)!;
}

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个乐于助人的 AI 助手。请根据对话历史提供连贯的回答。"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const chain = RunnableSequence.from([
  RunnablePassthrough.assign({
    input: (params: { input: string }) => params.input,
  }),
  prompt,
  model,
]);

const withHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: getSessionHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});

async function chat(sessionId: string, input: string) {
  const response = await withHistory.invoke(
    { input },
    { configurable: { sessionId } }
  );
  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  return text;
}

async function main() {
  console.log("=== RunnableWithMessageHistory 多会话 Demo ===\n");

  console.log("--- 会话 A（用户：小张）---");
  const a1 = "你好，我叫小张，我是做数据分析的。";
  console.log(`[小张] ${a1}`);
  console.log(`[AI]   ${await chat("session-a", a1)}\n`);

  console.log("--- 会话 B（用户：小李）---");
  const b1 = "你好，我叫小李，我是做产品设计的。";
  console.log(`[小李] ${b1}`);
  console.log(`[AI]   ${await chat("session-b", b1)}\n`);

  console.log("--- 回到会话 A ---");
  const a2 = "你还记得我的名字和职业吗？";
  console.log(`[小张] ${a2}`);
  console.log(`[AI]   ${await chat("session-a", a2)}\n`);

  console.log("--- 回到会话 B ---");
  const b2 = "你还记得我的名字和职业吗？";
  console.log(`[小李] ${b2}`);
  console.log(`[AI]   ${await chat("session-b", b2)}\n`);

  console.log("--- 新会话 C（无历史记录）---");
  const c1 = "你知道我是谁吗？";
  console.log(`[???] ${c1}`);
  console.log(`[AI]   ${await chat("session-c", c1)}\n`);

  console.log("=== 各会话历史条数 ===");
  for (const [id, history] of sessionStore.entries()) {
    const messages = await history.getMessages();
    console.log(`  ${id}: ${messages.length} 条消息`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
