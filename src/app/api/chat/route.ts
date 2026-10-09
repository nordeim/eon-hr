import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// /api/chat — direct messaging.
// GET  /api/chat                       → conversation list + user directory
// GET  /api/chat?conversationId=xxx    → message history (participant only)
// POST /api/chat { userId }            → find-or-create a 1:1 conversation
// POST /api/chat { conversationId, content } → send a message

const SendMessageInput = z.object({
  conversationId: z.string().min(1, "conversationId is required"),
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});

const CreateConversationInput = z.object({
  userId: z.string().min(1, "Pick someone to message"),
});

// Explicit payload unions — guard<T> needs one type per handler and these
// handlers legitimately return two different shapes.
interface MessagesData {
  messages: { id: string; content: string; sentAt: Date; senderId: string; senderName: string; senderAvatarUrl: string | null }[];
}
interface ConversationsData {
  conversations: {
    id: string;
    title: string;
    otherIds: string[];
    lastMessage: string | null;
    lastMessageAt: Date | null;
  }[];
  users: { id: string; name: string; email: string; role: string; avatarUrl: string | null }[];
}
interface SentMessageData {
  message: { id: string; content: string; sentAt: Date; senderId: string; senderName: string; senderAvatarUrl: string | null };
}
interface NewConversationData {
  conversationId: string;
  existing: boolean;
}

function parseParticipants(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function isParticipant(conversationId: string, userId: string): Promise<boolean> {
  const convo = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, participants: true },
  });
  if (!convo) return false;
  return parseParticipants(convo.participants).includes(userId);
}

export async function GET(req: NextRequest) {
  return guard<MessagesData | ConversationsData>(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const conversationId = req.nextUrl.searchParams.get("conversationId");

    // ---- message history for one conversation ----
    if (conversationId) {
      if (!(await isParticipant(conversationId, user.id))) {
        return err("NOT_FOUND", "Conversation not found");
      }
      const messages = await db.message.findMany({
        where: { conversationId },
        orderBy: { sentAt: "asc" },
        select: {
          id: true,
          content: true,
          sentAt: true,
          senderId: true,
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
      return ok({
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          sentAt: m.sentAt,
          senderId: m.senderId,
          senderName: m.sender.name,
          senderAvatarUrl: m.sender.avatarUrl,
        })),
      });
    }

    // ---- conversation list + user directory ----
    const mine = await db.conversation.findMany({
      where: { participants: { contains: JSON.stringify(user.id) } },
      orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
      select: { id: true, participants: true, lastMessageAt: true, createdAt: true },
    });

    const conversations = mine
      .map((c) => ({ ...c, participantIds: parseParticipants(c.participants) }))
      .filter((c) => c.participantIds.includes(user.id));

    const otherIds = Array.from(
      new Set(conversations.flatMap((c) => c.participantIds.filter((id) => id !== user.id)))
    );
    const otherUsers = otherIds.length
      ? await db.user.findMany({ where: { id: { in: otherIds } }, select: { id: true, name: true } })
      : [];

    const lastMessages = conversations.length
      ? await db.message.findMany({
          where: { conversationId: { in: conversations.map((c) => c.id) } },
          orderBy: { sentAt: "desc" },
          select: { conversationId: true, content: true, sentAt: true },
        })
      : [];
    const lastByConvo = new Map<string, { content: string; sentAt: Date }>();
    for (const m of lastMessages) {
      if (!lastByConvo.has(m.conversationId)) lastByConvo.set(m.conversationId, { content: m.content, sentAt: m.sentAt });
    }

    const nameById = new Map(otherUsers.map((u) => [u.id, u.name]));
    const allUsers = await db.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      orderBy: { name: "asc" },
    });

    return ok({
      conversations: conversations.map((c) => {
        const others = c.participantIds.filter((id) => id !== user.id);
        const last = lastByConvo.get(c.id) ?? null;
        return {
          id: c.id,
          title:
            others.length > 1
              ? `${others.length + 1} participants`
              : (nameById.get(others[0] ?? "") ?? "Conversation"),
          otherIds: others,
          lastMessage: last?.content ?? null,
          lastMessageAt: last?.sentAt ?? c.lastMessageAt ?? c.createdAt,
        };
      }),
      users: allUsers.filter((u) => u.id !== user.id),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard<SentMessageData | NewConversationData>(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return err("VALIDATION", "Invalid JSON body");
    }

    // ---- send a message into an existing conversation ----
    const asMessage = SendMessageInput.safeParse(raw);
    if (asMessage.success) {
      const { conversationId, content } = asMessage.data;
      if (!(await isParticipant(conversationId, user.id))) {
        return err("NOT_FOUND", "Conversation not found");
      }
      const message = await db.message.create({
        data: { conversationId, senderId: user.id, content },
        select: { id: true, content: true, sentAt: true },
      });
      await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: message.sentAt } });
      return ok({
        message: {
          id: message.id,
          content: message.content,
          sentAt: message.sentAt,
          senderId: user.id,
          senderName: user.name,
          senderAvatarUrl: user.avatarUrl,
        },
      });
    }

    // ---- start (or find) a 1:1 conversation ----
    const asConversation = CreateConversationInput.safeParse(raw);
    if (!asConversation.success) {
      return err("VALIDATION", "Provide either { conversationId, content } or { userId }");
    }
    const otherUserId = asConversation.data.userId;

    const other = await db.user.findUnique({ where: { id: otherUserId }, select: { id: true, name: true } });
    if (!other) return err("NOT_FOUND", "User not found");

    const candidates = await db.conversation.findMany({
      where: { participants: { contains: JSON.stringify(user.id) } },
      select: { id: true, participants: true },
    });
    const pair = [user.id, otherUserId].sort().join("|");
    const existing = candidates.find((c) => parseParticipants(c.participants).sort().join("|") === pair);
    if (existing) return ok({ conversationId: existing.id, existing: true });

    const convo = await db.conversation.create({
      data: { participants: JSON.stringify([user.id, otherUserId]), lastMessageAt: new Date() },
      select: { id: true },
    });
    return ok({ conversationId: convo.id, existing: false });
  });
}
