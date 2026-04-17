import type { UIMessage } from "ai";

/** 会话元信息 */
export interface Conversation {
  id: string;
  title: string;       // 取自第一条用户消息的前 30 个字符
  createdAt: number;
  updatedAt: number;
}

// localStorage 存储键
const CONVERSATIONS_KEY = "dailymate-conversations";
const MESSAGES_KEY_PREFIX = "dailymate-messages-";

/** 生成唯一会话 ID（时间戳 + 随机后缀） */
export function generateId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 从 localStorage 读取会话列表。
 * 在 SSR 环境中（window 不存在）安全返回空数组。
 */
export function getConversations(): Conversation[] {
  if (globalThis.window === undefined) return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

/** 将会话列表写入 localStorage */
function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

/** 创建新会话并插入到列表头部 */
export function createConversation(id?: string): Conversation {
  const conv: Conversation = {
    id: id ?? generateId(),
    title: "新对话",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const list = getConversations();
  list.unshift(conv);
  saveConversations(list);
  return conv;
}

/** 更新会话标题（通常在收到第一条用户消息后自动调用） */
export function updateConversationTitle(id: string, title: string) {
  const list = getConversations();
  const conv = list.find((c) => c.id === id);
  if (conv) {
    conv.title = title;
    conv.updatedAt = Date.now();
    saveConversations(list);
  }
}

/** 删除会话及其对应的消息记录 */
export function deleteConversation(id: string) {
  const list = getConversations().filter((c) => c.id !== id);
  saveConversations(list);
  localStorage.removeItem(MESSAGES_KEY_PREFIX + id);
}

/** 从 localStorage 读取指定会话的消息列表 */
export function getMessages(conversationId: string): UIMessage[] {
  if (globalThis.window === undefined) return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY_PREFIX + conversationId);
    if (!raw) return [];
    return JSON.parse(raw) as UIMessage[];
  } catch {
    return [];
  }
}

/**
 * 保存会话消息到 localStorage，并自动提取第一条用户消息作为会话标题。
 *
 * 标题提取逻辑：找到第一条 role="user" 的消息，取其文本 part 的前 30 个字符。
 */
export function saveMessages(conversationId: string, messages: UIMessage[]) {
  if (globalThis.window === undefined) return;
  localStorage.setItem(
    MESSAGES_KEY_PREFIX + conversationId,
    JSON.stringify(messages),
  );

  // 自动更新会话标题：取第一条用户消息的文本
  if (messages.length > 0) {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg) {
      const textPart = firstUserMsg.parts.find((p) => p.type === "text");
      if (textPart && "text" in textPart) {
        const title =
          textPart.text.length > 30
            ? textPart.text.slice(0, 30) + "..."
            : textPart.text;
        updateConversationTitle(conversationId, title);
      }
    }
  }
}
