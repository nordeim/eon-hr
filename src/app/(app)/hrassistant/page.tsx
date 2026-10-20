"use client";

import * as React from "react";
import { Bot, Loader2, Send } from "lucide-react";
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
            {/* Session 65 (R65-E): REF's pane is the block + space-y-4
                recipe (h-500 p-6 — live-measured 500px/24px; the clone
                authored a flex h-460 p-4 stack). The loader branch keeps
                its centering via h-full inside the fixed-height pane. */}
            <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
              {!booted ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : messages.length === 0 ? (
                /* Session 61 (R61-M) + Session 66 (R66-P): REF's zero-message
                   pane renders NOTHING — live-measured (no icon, no copy;
                   only the bot kicker + the send row). The r47-E5 "icon
                   only" pin is superseded by the r61 re-measure (the
                   sparkles retired); the r65-E loader-branch h-full div
                   leaked into the settled state and is retired too (the
                   r66 census: the pane is EMPTY at rest — no children). */
                null
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
            {/* Session 65 (R65-E): REF's input row — border-t p-4 flex
                gap-3 (live-measured 16px padding, row h≈93) with the
                min-h-[60px] textarea; the clone authored p-3 + a 48px
                textarea. The send Button keeps the R58-6 pin (REF's
                48×36 dark solid — verified unchanged this round). */}
            <div className="border-t p-4 flex gap-3">
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
                className="min-h-[60px] flex-1 resize-none"
              />
              {/* Session 58 (R58-6): REF's send is the DARK solid at the
                  DEFAULT size (h-9 px-4 py-2, icon-only → 48x36) — not
                  the 48x48 icon square (live-measured, the CTA-fill
                  census). */}
              <Button type="button" variant="dark" onClick={() => void onSend()} disabled={thinking || !draft.trim()}>
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
