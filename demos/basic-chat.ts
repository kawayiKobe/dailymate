import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { model } from "../src/model.js";

try {
  const reply = await model.invoke([
    new HumanMessage("夏天适合吃的水果是什么？"),
  ]);
  const text =
    typeof reply.content === "string"
      ? reply.content
      : JSON.stringify(reply.content);
  console.log(text);
} catch (err: unknown) {
  console.error(err);
  process.exitCode = 1;
}
