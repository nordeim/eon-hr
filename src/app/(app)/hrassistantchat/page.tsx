"use client";

import * as React from "react";
import { Bot, Loader2, MessageSquare, Plus, Send, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn, timeAgo } from "@/lib/utils";

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

export default function HrAssistantChatPage() {
  const toast = useToast();
  const [chats, setChats] = React.useState<ChatRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<AIMessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [thinking, setThinking] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const prevCountRef = React.useRef(0);

  const loadChats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/ai-chat");
      const json = await res.json();
      if (json.ok) setChats(json.data.chats);
      else toast.toast({ title: "Failed to load chats", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMessages = React.useCallback(
    async (chatId: string) => {
      setMessagesLoading(true);
      try {
        const res = await fetch(`/api/ai-chat?chatId=${chatId}`);
        const json = await res.json();
        if (json.ok) setMessages(json.data.messages);
        else toast.toast({ title: "Failed to load messages", description: json.error?.message, variant: "error" });
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setMessagesLoading(false);
      }
    },
    [toast]
  );

  React.useEffect(() => {
    void loadChats();
  }, [loadChats]);

  React.useEffect(() => {
    if (activeId) void loadMessages(activeId);
  }, [activeId, loadMessages]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length !== prevCountRef.current) {
      prevCountRef.current = messages.length;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const active = chats.find((c) => c.id === activeId) ?? null;

  async function onNewChat() {
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not start a chat", description: json.error?.message, variant: "error" });
        return;
      }
      setChats((prev) => [json.data.chat, ...prev]);
      setActiveId(json.data.chat.id);
      setMessages([]);
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onSend() {
    const text = draft.trim();
    if (!text || !activeId) return;
    setDraft("");
    setThinking(true);
    // optimistic user bubble
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: activeId, content: text }),
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
      // refresh titles/counts (auto-title from the first message)
      void loadChats();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#faf5ff,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="AI HR Assistant"
        layout="flat36"
        iconClassName="text-purple-600"
        sectionIcon={<Target aria-hidden="true" />}
        title="HR Assistant"
        subtitle="Chat with your AI-powered HR assistant"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        {/* chat list */}
        <Card className="flex h-64 flex-col lg:h-[calc(100vh-14rem)] lg:min-h-[560px]">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <Button variant="purple" size="sm" className="w-full" onClick={onNewChat}>
              <Plus className="mr-2" aria-hidden="true" />
              New Chat
            </Button>
            <p className="text-xs font-medium text-muted-foreground">Active Chats</p>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : chats.length === 0 ? (
                <EmptyState title="No chats" description="Start a new chat to ask a question." className="py-6" />
              ) : (
                <div className="flex flex-col gap-1">
                  {chats.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/60 cursor-pointer",
                        c.id === activeId && "bg-accent"
                      )}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{c.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {c.messageCount} messages · {timeAgo(c.createdAt)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* chat pane */}
        <Card className="flex h-[520px] flex-col lg:h-[calc(100vh-14rem)] lg:min-h-[560px]">
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{active.title}</p>
                  <p className="text-xs text-muted-foreground">Ask about leave, payroll, letters or policy</p>
                </div>
              </div>
              <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messagesLoading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState
                    icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
                    title="Ask me anything HR"
                    description="Leave balances, payroll periods, HR letters and company policy."
                    className="py-8"
                  />
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
                            "max-w-[75%] rounded-xl px-3.5 py-2 text-sm",
                            isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p
                            className={cn(
                              "mt-1 text-[11px]",
                              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {timeAgo(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {thinking ? (
                  <div className="flex items-end gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        <Bot className="h-4 w-4" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-xl bg-secondary px-3.5 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>
                ) : null}
              </div>
              <form
                className="flex items-end gap-2 border-t p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onSend();
                }}
              >
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void onSend();
                    }
                  }}
                  placeholder="Ask about leave, payroll, letters or policy..."
                  className="min-h-[44px] flex-1 resize-none"
                  aria-label="Message the HR assistant"
                  maxLength={2000}
                />
                <Button type="submit" size="icon" disabled={thinking || !draft.trim()} aria-label="Send message">
                  <Send aria-hidden="true" />
                </Button>
              </form>
            </>
          ) : (
            <CardContent className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={<Bot className="h-6 w-6" aria-hidden="true" />}
                title="Select a chat or start a new one"
                description="Your HR assistant answers questions about leave, payroll, HR letters and company policy."
              />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
    </div>
  );
}
