import "dotenv/config";
import { embeddings } from "./embeddings.js";

/**
 * 计算两个向量的余弦相似度。
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  console.log("=== Text Embeddings Demo ===\n");

  // ---- 1. 单条文本嵌入 ----
  const text = "LangChain 是一个用于构建 LLM 应用的开发框架。";
  console.log(`[embedQuery] "${text}"`);
  const vector = await embeddings.embedQuery(text);
  console.log(`  维度: ${vector.length}`);
  console.log(`  前5个分量: [${vector.slice(0, 5).map((v) => v.toFixed(6)).join(", ")}]\n`);

  // ---- 2. 批量文本嵌入 ----
  const docs = [
    "TypeScript 是 JavaScript 的超集，增加了类型系统。",
    "Python 是一门简洁易学的编程语言。",
    "JavaScript 常用于 Web 前端开发。",
    "深度学习是机器学习的一个分支。",
  ];
  console.log("[embedDocuments] 批量嵌入 4 条文本...");
  const vectors = await embeddings.embedDocuments(docs);
  console.log(`  每条向量维度: ${vectors[0].length}\n`);

  // ---- 3. 语义相似度比较 ----
  console.log("=== 语义相似度矩阵 ===\n");
  const labels = docs.map((d) => d.slice(0, 16) + "…");
  const header = ["".padEnd(18), ...labels.map((l) => l.padEnd(18))].join("");
  console.log(header);
  console.log("-".repeat(header.length));

  for (let i = 0; i < vectors.length; i++) {
    const row = [labels[i].padEnd(18)];
    for (let j = 0; j < vectors.length; j++) {
      const sim = cosineSimilarity(vectors[i], vectors[j]);
      row.push(sim.toFixed(4).padStart(8).padEnd(18));
    }
    console.log(row.join(""));
  }

  // ---- 4. 语义检索演示 ----
  console.log("\n=== 语义检索 Demo ===\n");
  const query = "前端开发用什么语言？";
  console.log(`查询: "${query}"\n`);

  const queryVec = await embeddings.embedQuery(query);
  const scored = docs
    .map((doc, idx) => ({
      doc,
      score: cosineSimilarity(queryVec, vectors[idx]),
    }))
    .sort((a, b) => b.score - a.score);

  scored.forEach(({ doc, score }, rank) => {
    console.log(`  #${rank + 1} [${score.toFixed(4)}] ${doc}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
