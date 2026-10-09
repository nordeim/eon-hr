"use client";

import * as React from "react";
import { Loader2, Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { initials, timeAgo } from "@/lib/utils";

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
}

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function AnnouncementsPage() {
  const toast = useToast();
  const [announcements, setAnnouncements] = React.useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [canPost, setCanPost] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", priority: "normal", content: "" });

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json.ok) setAnnouncements(json.data.announcements);
      else toast.toast({ title: "Failed to load announcements", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        setCanPost(["admin", "hr"].includes(json.data?.user?.role ?? ""));
      } catch {
        setCanPost(false);
      }
    })();
  }, []);

  async function onCreate() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.toast({ title: "Missing fields", description: "Title and content are required.", variant: "info" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          priority: form.priority,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to publish", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: "Announcement published",
        description: "Everyone received a notification.",
        variant: "success",
      });
      setDialogOpen(false);
      setForm({ title: "", priority: "normal", content: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Company Announcements"
        subtitle="Stay informed with the latest updates"
        actions={
          canPost ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus aria-hidden="true" />
              New Announcement
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={<Megaphone className="h-6 w-6" aria-hidden="true" />}
            title="No announcements at this time"
            description="Company-wide announcements will appear here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-foreground">{a.title}</h2>
                  <StatusBadge status={a.priority} />
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{a.content}</p>
                <div className="flex items-center gap-2 border-t pt-3">
                  <Avatar className="h-6 w-6">
                    {a.authorAvatarUrl ? <AvatarImage src={a.authorAvatarUrl} alt={a.authorName} /> : null}
                    <AvatarFallback className="text-[10px]">{initials(a.authorName)}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">
                    {a.authorName} · {timeAgo(a.publishedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Publish a company-wide update.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onCreate();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ann-title">Title</Label>
              <Input
                id="ann-title"
                required
                maxLength={140}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Quarterly town hall"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ann-priority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger id="ann-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ann-content">Content</Label>
              <Textarea
                id="ann-content"
                required
                maxLength={4000}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Share the details with your team..."
                className="min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Publish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
