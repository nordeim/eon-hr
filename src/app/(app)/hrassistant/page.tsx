"use client";

import * as React from "react";
import { Bot, Loader2, Send, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ChatRow {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

interface AIMessageRow {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

/**
 * The /hrassistant orphan route — parity round 31 (R31-C4).
 *
 * REF serves this page (registry: HRAssistant — DISTINCT from
 * /hrassistantchat's two-pane layout): a single-pane chat under a
 * max-w-4xl mx-auto stack. The centered header: the "AI HR Assistant"
 * kicker pill (107px @ x=807 y=40) + the 36px "HR Assistant" h1 (y=84)
 * + the 18px slate-600 line (y=136); the shadow-xl chat card (896px)
 * with the "Ask me anything about HR..." textarea + the 48px dark send
 * button (docs/remediation-plan-session32.md). Superset: persists via
 * the existing /api/ai-chat (the hrassistantchat pattern, single pane).
 */
export default function HrAssistantPage() {
  const toast = useToast();
  const [chats, setChats] = React.useState<ChatRow[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<AIMessageRow[]>([]);
  const [draft, setDraft] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [booted, setBooted] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const prevCountRef = React.useRef(0);

  const ensureChat = React.useCallback(async (): Promise<string | null> => {
    if (activeId) return activeId;
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not start a chat", description: json.error?.message, variant: "error" });
        return null;
      }
      setChats((prev) => [json.data.chat, ...prev]);
      setActiveId(json.data.chat.id);
      return json.data.chat.id as string;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return null;
    }
  }, [activeId, toast]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ai-chat");
        const json = await res.json();
        if (json.ok && json.data.chats.length > 0) {
          setChats(json.data.chats);
          setActiveId(json.data.chats[0].id);
        }
      } catch {
        /* zero chats — the first send creates one */
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length !== prevCountRef.current) {
      prevCountRef.current = messages.length;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  async function onSend() {
    const text = draft.trim();
    if (!text) return;
    const chatId = await ensureChat();
    if (!chatId) return;
    setDraft("");
    setThinking(true);
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() }]);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, content: text }),
      });
      const json = await res.json();
      if (!json.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setDraft(text);
        toast.toast({ title: "Message failed", description: json.error?.message, variant: "error" });
        return;
      }
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        json.data.userMessage,
        json.data.assistantMessage,
      ]);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row;
         *  the centered variant carries text-center ONLY).
         *  Live-measured @1440×900 this round. */
        bare
          section="AI HR Assistant"
          layout="flat36"
          iconClassName="text-blue-600"
          sectionIcon={<Bot aria-hidden="true" />}
          title="HR Assistant"
          subtitle="Ask me anything about HR policies, leave, payroll, and more"
          centered
        />

        <Card className="border-slate-200 shadow-xl">
          <CardContent className="p-0">
            <div ref={scrollRef} className="flex h-[460px] flex-col gap-3 overflow-y-auto p-4">
              {!booted ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : messages.length === 0 ? (
                /* Session 48 (R47-E5): REF's zero chat renders the icon
                   only — no suggestion line (the r46 census; the clone's
                   copy line retires with the training precedent). */
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-slate-300" aria-hidden="true" />
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={m.id} className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
                      {!isUser ? (
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-accent text-accent-foreground">
                            <Bot className="h-4 w-4" aria-hidden="true" />
                          </AvatarFallback>
                        </Avatar>
                      ) : null}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                          isUser ? "bg-blue-600 text-white" : "bg-secondary text-foreground"
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex items-end gap-2 border-t p-3">
              <Textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void onSend();
                  }
                }}
                placeholder="Ask me anything about HR..."
                className="min-h-[48px] flex-1 resize-none"
              />
              <Button type="button" size="icon" className="h-12 w-12" onClick={() => void onSend()} disabled={thinking || !draft.trim()}>
                {thinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
