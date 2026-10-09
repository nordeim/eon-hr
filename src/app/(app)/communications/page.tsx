"use client";

import * as React from "react";
import { Loader2, Mail, MessageCircle, MessageSquare, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/utils";

interface EmployeeRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
}

interface LogRow {
  id: string;
  channel: string;
  recipients: string[];
  recipientsCount: number;
  subject: string | null;
  body: string;
  status: string;
  sentAt: string;
}

type Channel = "email" | "sms" | "whatsapp";

const CHANNELS: {
  key: Channel;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "email",
    title: "Send Email",
    description: "Send emails to employees",
    icon: <Mail className="h-5 w-5" aria-hidden="true" />,
  },
  {
    key: "sms",
    title: "Send SMS",
    description: "Send text messages",
    icon: <MessageSquare className="h-5 w-5" aria-hidden="true" />,
  },
  {
    key: "whatsapp",
    title: "Send WhatsApp",
    description: "Send WhatsApp messages",
    icon: <Phone className="h-5 w-5" aria-hidden="true" />,
  },
];

const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export default function CommunicationsPage() {
  const toast = useToast();
  const [logs, setLogs] = React.useState<LogRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogChannel, setDialogChannel] = React.useState<Channel | null>(null);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [sending, setSending] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [logsRes, empRes] = await Promise.all([fetch("/api/communications"), fetch("/api/employees")]);
      const logsJson = await logsRes.json();
      const empJson = await empRes.json();
      if (logsJson.ok) setLogs(logsJson.data.logs);
      else toast.toast({ title: "Failed to load history", description: logsJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  function openDialog(channel: Channel) {
    setDialogChannel(channel);
    setSubject("");
    setMessage("");
    setSelected(new Set());
  }

  function toggleRecipient(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSend() {
    if (!dialogChannel) return;
    if (selected.size === 0) {
      toast.toast({ title: "No recipients", description: "Select at least one employee.", variant: "info" });
      return;
    }
    if (!message.trim()) {
      toast.toast({ title: "Empty message", description: "Write your message before sending.", variant: "info" });
      return;
    }
    if (dialogChannel === "email" && !subject.trim()) {
      toast.toast({ title: "Subject required", description: "Emails need a subject line.", variant: "info" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: dialogChannel,
          recipientIds: Array.from(selected),
          subject: dialogChannel === "email" ? subject.trim() : "",
          message: message.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Send failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: `${CHANNEL_LABEL[dialogChannel]} sent`,
        description: `${json.data.log.recipientsCount} recipient(s) received your message.`,
        variant: "success",
      });
      setDialogChannel(null);
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Communications"
        sectionIcon={<MessageCircle aria-hidden="true" />}
        title="Communications"
        subtitle="Send emails, SMS, and WhatsApp messages to your team"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CHANNELS.map((c) => (
          <Card key={c.key}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                {c.icon}
              </div>
              <div>
                <p className="font-medium text-foreground">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
              <Button className="w-full" onClick={() => openDialog(c.key)}>
                <Send aria-hidden="true" />
                {c.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
          <CardDescription>Everything you've sent recently.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState title="No communications yet" description="Send your first message to see it here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-foreground">
                      {CHANNEL_LABEL[l.channel as Channel] ?? l.channel}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {l.recipientsCount}
                      {l.recipients.length > 0 ? (
                        <span className="hidden text-xs text-muted-foreground/70 sm:inline">
                          {" "}
                          · {l.recipients.slice(0, 3).join(", ")}
                          {l.recipients.length > 3 ? "…" : ""}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-muted-foreground">
                      {l.subject ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={l.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(l.sentAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogChannel !== null} onOpenChange={(o) => !o && setDialogChannel(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogChannel ? CHANNEL_LABEL[dialogChannel] : ""} — Compose
            </DialogTitle>
            <DialogDescription>
              {dialogChannel === "email"
                ? "Write an email to the selected employees."
                : "Write a short message to the selected employees."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onSend();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Recipients</Label>
                <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              </div>
              <div className="max-h-52 overflow-y-auto rounded-lg border p-2">
                {employees.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No employees to message yet</p>
                ) : (
                  employees.map((e) => (
                    <label
                      key={e.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-secondary/60"
                    >
                      <Checkbox
                        checked={selected.has(e.id)}
                        onCheckedChange={() => toggleRecipient(e.id)}
                        aria-label={`Select ${e.firstName}`}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {e.firstName} {e.lastName}
                        <span className="text-xs text-muted-foreground"> · {e.email}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
            {dialogChannel === "email" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="comm-subject">Subject</Label>
                <Input
                  id="comm-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Monthly update"
                  maxLength={200}
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="comm-message">Message</Label>
              <Textarea
                id="comm-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                className="min-h-[110px]"
                maxLength={2000}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogChannel(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
