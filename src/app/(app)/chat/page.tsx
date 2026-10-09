"use client";

import * as React from "react";
import { Loader2, MessageSquarePlus, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn, initials, timeAgo } from "@/lib/utils";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

interface ConversationRow {
  id: string;
  title: string;
  otherIds: string[];
  lastMessage: string | null;
  lastMessageAt: string | null;
}

interface MessageRow {
  id: string;
  content: string;
  sentAt: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
}

const POLL_MS = 4000;

export default function ChatPage() {
  const toast = useToast();
  const [conversations, setConversations] = React.useState<ConversationRow[]>([]);
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [selfId, setSelfId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerSearch, setPickerSearch] = React.useState("");

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const prevCountRef = React.useRef(0);
  const erroredRef = React.useRef(false);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        setSelfId(json.data?.user?.id ?? null);
      } catch {
        setSelfId(null);
      }
    })();
  }, []);

  const loadConversations = React.useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      const json = await res.json();
      if (json.ok) {
        setConversations(json.data.conversations);
        setUsers(json.data.users);
        erroredRef.current = false;
      } else if (!erroredRef.current) {
        erroredRef.current = true;
        toast.toast({ title: "Failed to load conversations", variant: "error" });
      }
    } catch {
      if (!erroredRef.current) {
        erroredRef.current = true;
        toast.toast({ title: "Network error", variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMessages = React.useCallback(async (conversationId: string, quiet = false) => {
    if (!quiet) setMessagesLoading(true);
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`);
      const json = await res.json();
      if (json.ok) setMessages(json.data.messages);
      else if (!quiet) toast.toast({ title: "Failed to load messages", description: json.error?.message, variant: "error" });
    } catch {
      if (!quiet) toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    if (activeId) void loadMessages(activeId);
  }, [activeId, loadMessages]);

  // poll for new messages every 4 seconds
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      void loadConversations();
      if (activeId) void loadMessages(activeId, true);
    }, POLL_MS);
    return () => window.clearInterval(interval);
  }, [loadConversations, loadMessages, activeId]);

  // keep the newest message in view (only when the list actually grows)
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length !== prevCountRef.current) {
      prevCountRef.current = messages.length;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const activeOther = active ? users.find((u) => u.id === active.otherIds[0]) ?? null : null;

  async function onSend() {
    const text = draft.trim();
    if (!text || !activeId) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, content: text }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Message failed", description: json.error?.message, variant: "error" });
        return;
      }
      setMessages((prev) => [...prev, json.data.message]);
      setDraft("");
      void loadConversations();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSending(false);
    }
  }

  async function startConversation(userId: string) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not start conversation", description: json.error?.message, variant: "error" });
        return;
      }
      setPickerOpen(false);
      setPickerSearch("");
      await loadConversations();
      setActiveId(json.data.conversationId);
      toast.toast({ title: "Conversation ready", description: "Say hello!", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.trim().toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(pickerSearch.trim().toLowerCase())
  );

  return (
    /* Reference layout (session-4 live measurement): NO page header — a
       single bordered card (rounded-xl, shadow-lg, border-slate-200,
       overflow-hidden, h-[calc(100vh-8rem)]) inset in the standard page
       container, split into a w-80 conversation column (border-r) and the
       message pane. "Messages" is an h2 18px/700 inside the list header with
       a 40×32 blue + button. */
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
      <div className="flex h-[calc(100vh-8rem)] min-h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        {/* conversation list */}
        <div className="hidden w-80 shrink-0 flex-col border-r border-slate-200 md:flex">
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <h2 className="text-lg font-bold text-foreground">Messages</h2>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="New conversation"
              className="flex h-8 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition-colors hover:bg-blue-700 cursor-pointer"
            >
              <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="relative px-4 pb-3">
            <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Search conversations"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <EmptyState
                title="No conversations yet"
                description="Start a new conversation to message a teammate."
                className="py-8"
              />
            ) : (
              <div className="flex flex-col gap-1">
                {filteredConversations.map((c) => {
                  const other = users.find((u) => u.id === c.otherIds[0]) ?? null;
                  const isActive = c.id === activeId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/60 cursor-pointer",
                        isActive && "bg-accent"
                      )}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        {other?.avatarUrl ? <AvatarImage src={other.avatarUrl} alt={other.name} /> : null}
                        <AvatarFallback>{initials(c.title)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.lastMessage ?? "No messages yet"}
                        </p>
                      </div>
                      {c.lastMessageAt ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {timeAgo(c.lastMessageAt)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* message pane */}
        <div className="flex min-w-0 flex-1 flex-col">
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 p-4">
                <Avatar className="h-9 w-9">
                  {activeOther?.avatarUrl ? (
                    <AvatarImage src={activeOther.avatarUrl} alt={activeOther.name} />
                  ) : null}
                  <AvatarFallback>{initials(active.title)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{active.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeOther ? activeOther.email : "Direct message"}
                  </p>
                </div>
              </div>
              <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messagesLoading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState
                    title="No messages yet"
                    description="Send the first message to get the conversation going."
                    className="py-8"
                  />
                ) : (
                  messages.map((m) => {
                    const own = selfId !== null && m.senderId === selfId;
                    return (
                      <div key={m.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-xl px-3.5 py-2 text-sm",
                            own
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          {!own ? (
                            <p className="mb-0.5 text-xs font-medium text-muted-foreground">{m.senderName}</p>
                          ) : null}
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p className={cn("mt-1 text-[11px]", own ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {timeAgo(m.sentAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form
                className="flex items-end gap-2 border-t border-slate-200 p-4"
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
                  placeholder="Type a message..."
                  className="min-h-[44px] flex-1 resize-none"
                  aria-label="Message"
                  maxLength={2000}
                />
                <Button type="submit" size="icon" disabled={sending || !draft.trim()} aria-label="Send message">
                  {sending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyState
                icon={<MessageSquarePlus className="h-6 w-6" aria-hidden="true" />}
                title="Select a conversation"
                description="Choose a conversation to start messaging"
              />
            </div>
          )}
        </div>
      </div>
    </div>

      {/* new conversation picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New conversation</DialogTitle>
            <DialogDescription>Pick someone to start messaging.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search people..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="pl-10"
              aria-label="Search people"
              autoFocus
            />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No people found</p>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => void startConversation(u.id)}
                    className="flex items-center gap-3 rounded-lg p-2 text-left hover:bg-secondary/60 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt={u.name} /> : null}
                      <AvatarFallback>{initials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
