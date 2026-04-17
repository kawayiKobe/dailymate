import "dotenv/config";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { embeddings } from "./embeddings.js";
import { model } from "../src/model.js";
import fs from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(import.meta.dirname ?? ".", "../.vectorstore");
const STORE_FILE = path.join(STORE_DIR, "vectors.json");

// ---------------------------------------------------------------------------
// 知识库文档 —— 模拟一个小型技术 FAQ
// ---------------------------------------------------------------------------
const knowledgeBase: Document[] = [
  new Document({
    pageContent:
      "LangChain 是一个用于构建大语言模型（LLM）应用的开源框架，提供了链（Chain）、代理（Agent）、记忆（Memory）等核心抽象，支持 Python 和 JavaScript/TypeScript。",
    metadata: { source: "faq", topic: "langchain" },
  }),
  new Document({
    pageContent:
      "向量数据库（Vector Store）将文本转换为高维向量后存储，支持基于语义相似度的快速检索。常见的向量数据库有 Chroma、Pinecone、Milvus、Weaviate、FAISS 等。",
    metadata: { source: "faq", topic: "vectorstore" },
  }),
  new Document({
    pageContent:
      "RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合检索与生成的技术：先从知识库中检索相关文档，再将检索结果作为上下文提供给 LLM 生成回答，有效减少幻觉。",
    metadata: { source: "faq", topic: "rag" },
  }),
  new Document({
    pageContent:
      "Embeddings（文本嵌入）是将文本映射为固定长度数值向量的技术。语义相近的文本在向量空间中距离更近。OpenAI 的 text-embedding-3-small 和 text-embedding-3-large 是常用的嵌入模型。",
    metadata: { source: "faq", topic: "embeddings" },
  }),
  new Document({
    pageContent:
      "LangChain 的 Memory 模块用于在多轮对话中保持上下文。常见策略包括：BufferMemory（全量保存）、WindowMemory（滑动窗口）、SummaryMemory（摘要压缩）、TokenBufferMemory（按 token 裁剪）。",
    metadata: { source: "faq", topic: "memory" },
  }),
  new Document({
    pageContent:
      "Text Splitter（文本分割器）用于将长文档切分为较小的块（chunk），以便嵌入和检索。常用策略有 RecursiveCharacterTextSplitter（递归字符分割）和 TokenTextSplitter（按 token 分割）。分块大小和重叠量会影响检索质量。",
    metadata: { source: "docs", topic: "splitter" },
  }),
  new Document({
    pageContent:
      "TypeScript 是 JavaScript 的超集，增加了静态类型系统。LangChain.js 完全使用 TypeScript 编写，提供了完善的类型定义，适合构建生产级 LLM 应用。",
    metadata: { source: "docs", topic: "typescript" },
  }),
  new Document({
    pageContent:
      "Prompt Template（提示模板）用于构建结构化的提示词。LangChain 支持 ChatPromptTemplate、FewShotPromptTemplate 等，可以将变量插入模板，实现提示词的复用和组合。",
    metadata: { source: "docs", topic: "prompt" },
  }),
];

// ---------------------------------------------------------------------------
// 持久化工具：将 MemoryVectorStore 的数据序列化 / 反序列化为 JSON
// ---------------------------------------------------------------------------

interface SerializedVector {
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

async function saveStore(store: MemoryVectorStore): Promise<void> {
  const raw = (store as any).memoryVectors as Array<{
    content: string;
    embedding: number[];
    metadata: Record<string, unknown>;
  }>;
  const data: SerializedVector[] = raw.map((v) => ({
    content: v.content,
    embedding: v.embedding,
    metadata: v.metadata,
  }));
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(data));
  console.log(`  ✅ 已保存 ${data.length} 条向量到 ${STORE_FILE}`);
}

async function loadStore(): Promise<MemoryVectorStore> {
  const raw: SerializedVector[] = JSON.parse(
    fs.readFileSync(STORE_FILE, "utf-8"),
  );
  const store = new MemoryVectorStore(embeddings);
  (store as any).memoryVectors = raw.map((v) => ({
    content: v.content,
    embedding: v.embedding,
    metadata: v.metadata,
  }));
  console.log(`  ✅ 已从磁盘加载 ${raw.length} 条向量`);
  return store;
}

function storeExists(): boolean {
  return fs.existsSync(STORE_FILE);
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  // ============ 1. 构建 / 加载向量存储 ============
  let store: MemoryVectorStore;

  if (storeExists()) {
    console.log("=== 1. 从磁盘加载已有向量存储 ===\n");
    store = await loadStore();
  } else {
    console.log("=== 1. 首次运行：构建向量存储并持久化 ===\n");
    console.log(`  正在嵌入 ${knowledgeBase.length} 条文档...`);
    store = await MemoryVectorStore.fromDocuments(knowledgeBase, embeddings);
    await saveStore(store);
  }

  // ============ 2. 相似度检索 ============
  console.log("\n=== 2. 相似度检索（Similarity Search） ===\n");

  const query1 = "什么是 RAG？";
  console.log(`  查询: "${query1}"`);
  const results1 = await store.similaritySearchWithScore(query1, 3);
  for (const [doc, score] of results1) {
    console.log(`  [${score.toFixed(4)}] ${doc.pageContent.slice(0, 60)}…`);
    console.log(`           metadata: ${JSON.stringify(doc.metadata)}`);
  }

  // ============ 3. 带元数据过滤的检索 ============
  console.log("\n=== 3. 带元数据过滤的检索 ===\n");

  const query2 = "LangChain 有哪些功能？";
  console.log(`  查询: "${query2}"  (过滤: source=docs)`);
  const results2 = await store.similaritySearch(query2, 3, (doc) =>
    doc.metadata.source === "docs",
  );
  for (const doc of results2) {
    console.log(`  - ${doc.pageContent.slice(0, 60)}…`);
    console.log(`    metadata: ${JSON.stringify(doc.metadata)}`);
  }

  // ============ 4. 作为 Retriever 使用 ============
  console.log("\n=== 4. 向量存储 → Retriever ===\n");

  const retriever = store.asRetriever({ k: 3 });
  const query3 = "如何减少大模型幻觉？";
  console.log(`  查询: "${query3}"`);
  const retrieved = await retriever.invoke(query3);
  console.log(`  检索到 ${retrieved.length} 条文档：`);
  for (const doc of retrieved) {
    console.log(`  - [${doc.metadata.topic}] ${doc.pageContent.slice(0, 50)}…`);
  }

  // ============ 5. RAG：检索增强生成 ============
  console.log("\n=== 5. RAG —— 检索增强生成 ===\n");

  const ragPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `你是一个技术助手。根据以下检索到的上下文回答用户的问题。
如果上下文中没有相关信息，请如实说明。

上下文：
{context}`,
    ],
    ["human", "{question}"],
  ]);

  const formatDocs = (docs: Document[]) =>
    docs.map((d) => d.pageContent).join("\n\n");

  const ragChain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: (input: string) => input,
    },
    ragPrompt,
    model,
    new StringOutputParser(),
  ]);

  const question = "LangChain 的记忆模块有哪些策略？各自适用场景是什么？";
  console.log(`  问题: "${question}"\n`);
  console.log("  回答：");

  const answer = await ragChain.invoke(question);
  console.log(`  ${answer.replaceAll("\n", "\n  ")}`);

  // ============ 6. 增量添加文档 & 重新持久化 ============
  console.log("\n=== 6. 增量添加文档 ===\n");

  const newDoc = new Document({
    pageContent:
      "LangGraph 是 LangChain 生态中的新组件，用于构建有状态的、多步骤的 Agent 工作流。它使用图结构定义节点和边，支持循环、条件分支和人机协作。",
    metadata: { source: "docs", topic: "langgraph" },
  });

  await store.addDocuments([newDoc]);
  console.log("  已添加 1 条新文档，重新持久化...");
  await saveStore(store);

  const query4 = "LangGraph 是什么？";
  console.log(`\n  验证检索: "${query4}"`);
  const results4 = await store.similaritySearch(query4, 1);
  console.log(`  → ${results4[0].pageContent.slice(0, 80)}…`);

  console.log("\n✅ Demo 完成！");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
