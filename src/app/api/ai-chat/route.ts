import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser } from "@/lib/api";
import { generateHrReply } from "@/lib/hr-assistant";

// /api/ai-chat — rule-based HR assistant conversations.
// GET  /api/ai-chat                  → chat list
// GET  /api/ai-chat?chatId=xxx       → messages (owner only)
// POST /api/ai-chat { title? }       → new chat
// POST /api/ai-chat { chatId, content } → user message + assistant reply

const NewChatInput = z.object({
  title: z.string().trim().max(80).optional().or(z.literal("")),
});

const SendMessageInput = z.object({
  chatId: z.string().min(1, "chatId is required"),
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});

const FALLBACK_TITLE = "New Chat";

// Explicit payload unions — these handlers return two different ok() shapes.
interface AIMessageData {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}
interface ChatThreadData {
  chat: { id: string; title: string };
  messages: AIMessageData[];
}
interface ChatListData {
  chats: { id: string; title: string; createdAt: Date; messageCount: number }[];
}
interface AssistantReplyData {
  userMessage: AIMessageData;
  assistantMessage: AIMessageData;
  title: string;
}
interface NewChatData {
  chat: { id: string; title: string; createdAt: Date; messageCount: number };
}

export async function GET(req: NextRequest) {
  return guard<ChatThreadData | ChatListData>(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const chatId = req.nextUrl.searchParams.get("chatId");

    if (chatId) {
      const chat = await db.aIChat.findUnique({ where: { id: chatId }, select: { userId: true, title: true } });
      if (!chat || chat.userId !== user.id) return err("NOT_FOUND", "Chat not found");
      const messages = await db.aIMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      });
      return ok({ chat: { id: chatId, title: chat.title }, messages });
    }

    const chats = await db.aIChat.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
    });
    return ok({
      chats: chats.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        messageCount: c._count.messages,
      })),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard<AssistantReplyData | NewChatData>(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return err("VALIDATION", "Invalid JSON body");
    }

    // ---- send a message → assistant replies ----
    const asMessage = SendMessageInput.safeParse(raw);
    if (asMessage.success) {
      const { chatId, content } = asMessage.data;
      const chat = await db.aIChat.findUnique({ where: { id: chatId }, select: { id: true, userId: true, title: true } });
      if (!chat || chat.userId !== user.id) return err("NOT_FOUND", "Chat not found");

      const userMessage = await db.aIMessage.create({
        data: { chatId, role: "user", content },
        select: { id: true, role: true, content: true, createdAt: true },
      });

      const reply = generateHrReply(content);
      const assistantMessage = await db.aIMessage.create({
        data: { chatId, role: "assistant", content: reply },
        select: { id: true, role: true, content: true, createdAt: true },
      });

      // auto-title the chat from the first user message
      let title = chat.title;
      if (title === FALLBACK_TITLE) {
        title = content.length > 42 ? `${content.slice(0, 39)}...` : content;
        await db.aIChat.update({ where: { id: chatId }, data: { title } });
      }

      return ok({ userMessage, assistantMessage, title });
    }

    // ---- create a new chat ----
    const asNewChat = NewChatInput.safeParse(raw);
    if (!asNewChat.success) {
      return err("VALIDATION", "Provide either { chatId, content } or { title }");
    }
    const chat = await db.aIChat.create({
      data: { userId: user.id, title: asNewChat.data.title || FALLBACK_TITLE },
      select: { id: true, title: true, createdAt: true },
    });
    return ok({ chat: { id: chat.id, title: chat.title, createdAt: chat.createdAt, messageCount: 0 } });
  });
}
