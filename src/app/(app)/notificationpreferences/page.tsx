"use client";

import * as React from "react";
import { CheckCircle2, CheckCheck, FileText, Info, Loader2, Mail, Megaphone, Save, UserPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
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

const PREF_ROWS: { key: keyof Preferences; label: string; description: string; icon: React.ReactNode }[] = [
  { key: "emailEnabled", label: "Email Notifications", description: "Receive notifications via email", icon: <Mail className="h-4 w-4" aria-hidden="true" /> },
  { key: "inAppEnabled", label: "In-App Notifications", description: "Show notification bell in the app", icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> },
  { key: "approvals", label: "Approval Decisions", description: "When your request is approved or rejected", icon: <UserPlus className="h-4 w-4" aria-hidden="true" /> },
  { key: "rejections", label: "Rejection Alerts", description: "Specific alert when a request is rejected", icon: <XCircle className="h-4 w-4" aria-hidden="true" /> },
  { key: "assignments", label: "Task Assignments", description: "When a task or request is assigned to you", icon: <Megaphone className="h-4 w-4" aria-hidden="true" /> },
  { key: "announcements", label: "Announcements", description: "Company-wide announcements and notices", icon: <Info className="h-4 w-4" aria-hidden="true" /> },
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PageHeader
        size="md"
        title="Notification Settings"
        subtitle="Manage how and when you receive notifications"
      />

      {/* Session 13 (R12-A): the reference's stat row — text-xs labels
          (16px line, 86px tiles) with per-tile value colors (Unread
          red-500, Total blue-600) + the Mark All Read button card. */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard variant="mini-centered" label="Unread" value={unread} labelClassName="text-xs text-slate-500" valueClassName="text-red-500" />
        <StatCard variant="mini-centered" label="Total" value={total} labelClassName="text-xs text-slate-500" valueClassName="text-blue-600" />
        <Card>
          <CardContent className="flex items-center justify-center p-4">
            <Button variant="outline" size="sm" onClick={onMarkAllRead} disabled={marking || unread === 0}>
              <CheckCheck className="mr-1" aria-hidden="true" />
              Mark All Read
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Session 13 (R12-A): title-only header; preference rows carry
          border-b + 32px icon chips (p-2 bg-slate-100 rounded-lg) with
          gap-3 clusters; the save row is pt-2 justify-end with an iconed
          button — REF-measured. */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          {prefs === null ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : (
            PREF_ROWS.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">{row.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-xs text-slate-500">{row.description}</p>
                  </div>
                </div>
                <Switch
                  checked={prefs[row.key]}
                  onCheckedChange={(v) => setPrefs({ ...prefs, [row.key]: v })}
                  aria-label={row.label}
                />
              </div>
            ))
          )}
          <div className="pt-2 flex justify-end">
            <Button onClick={onSavePreferences} disabled={savingPrefs || prefs === null}>
              {savingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2" aria-hidden="true" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="mx-auto mb-2 h-8 w-8" aria-hidden="true" />
              <p className="text-sm">No notifications yet</p>
            </div>
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
