"use client";

import * as React from "react";
import { CheckCircle2, CheckCheck, Info, Loader2, Megaphone, UserPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn, timeAgo } from "@/lib/utils";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
}

interface Preferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  approvals: boolean;
  rejections: boolean;
  assignments: boolean;
  announcements: boolean;
}

const PREF_ROWS: { key: keyof Preferences; label: string; description: string }[] = [
  { key: "emailEnabled", label: "Email Notifications", description: "Receive notifications via email" },
  { key: "inAppEnabled", label: "In-App Notifications", description: "Show notification bell in the app" },
  { key: "approvals", label: "Approval Decisions", description: "When your request is approved or rejected" },
  { key: "rejections", label: "Rejection Alerts", description: "Specific alert when a request is rejected" },
  { key: "assignments", label: "Task Assignments", description: "When a task or request is assigned to you" },
  { key: "announcements", label: "Announcements", description: "Company-wide announcements and notices" },
];

function iconForType(type: string) {
  switch (type) {
    case "approval":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
    case "rejection":
      return <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />;
    case "assignment":
      return <UserPlus className="h-4 w-4 text-blue-600" aria-hidden="true" />;
    case "announcement":
      return <Megaphone className="h-4 w-4 text-amber-600" aria-hidden="true" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
  }
}

export default function NotificationPreferencesPage() {
  const toast = useToast();
  const [notifications, setNotifications] = React.useState<NotificationRow[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [prefs, setPrefs] = React.useState<Preferences | null>(null);
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [marking, setMarking] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.ok) {
        setNotifications(json.data.notifications);
        setUnread(json.data.unread);
        setTotal(json.data.total);
      } else {
        toast.toast({ title: "Failed to load notifications", description: json.error?.message, variant: "error" });
      }
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadPrefs = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notification-preferences");
      const json = await res.json();
      if (json.ok) setPrefs(json.data.preferences);
      else toast.toast({ title: "Failed to load preferences", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
    void loadPrefs();
  }, [load, loadPrefs]);

  async function onSavePreferences() {
    if (!prefs) return;
    setSavingPrefs(true);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailEnabled: prefs.emailEnabled,
          inAppEnabled: prefs.inAppEnabled,
          approvals: prefs.approvals,
          rejections: prefs.rejections,
          assignments: prefs.assignments,
          announcements: prefs.announcements,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return;
      }
      setPrefs(json.data.preferences);
      toast.toast({ title: "Preferences saved", description: "Your notification settings are up to date.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSavingPrefs(false);
    }
  }

  async function onMarkAllRead() {
    setMarking(true);
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to mark as read", description: json.error?.message, variant: "error" });
        return;
      }
      await load();
      toast.toast({ title: "All caught up", description: `${json.data.updated} notification(s) marked read.`, variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Notification Settings"
        subtitle="Manage how and when you receive notifications"
        actions={
          <Button variant="outline" onClick={onMarkAllRead} disabled={marking || unread === 0}>
            {marking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCheck aria-hidden="true" />}
            Mark All Read
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Unread" value={unread} icon={<Megaphone className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Total" value={total} icon={<Info className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose what you get notified about and how.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {prefs === null ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            PREF_ROWS.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.description}</p>
                </div>
                <Switch
                  checked={prefs[row.key]}
                  onCheckedChange={(v) => setPrefs({ ...prefs, [row.key]: v })}
                  aria-label={row.label}
                />
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={onSavePreferences} disabled={savingPrefs || prefs === null}>
            {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>The latest events across your HR account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications yet" description="You're all caught up." />
          ) : (
            <div className="flex flex-col gap-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-secondary/40"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    {iconForType(n.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm", n.read ? "font-medium text-muted-foreground" : "font-semibold text-foreground")}>
                      {n.title}
                    </p>
                    {n.body ? <p className="truncate text-xs text-muted-foreground">{n.body}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    {!n.read ? <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" /> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
