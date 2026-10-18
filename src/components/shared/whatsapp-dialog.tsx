"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

/* Session 57 (R57-C): REF's "Configure WhatsApp API" dialog — the recipe
   live-measured at 1440×900 (the r57 census phase C): the max-w-lg
   frame, the three space-y-2 fields (API Key required / Phone Number
   with country code required / the optional Webhook URL), the
   justify-end gap-3 footer (outline Cancel + primary Save
   Configuration). REF's own Save closes silently with nothing stored
   (measured: no tile change, no toast); the clone persists the config
   to the Integration model and answers with a toast — the superset. */

export function WhatsappDialog({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  function onSave() {
    setSaving(true);
    void (async () => {
      try {
        const res = await fetch("/api/integrations/whatsapp", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: apiKey.trim(),
            phoneNumber: phoneNumber.trim(),
            ...(webhookUrl.trim() ? { webhookUrl: webhookUrl.trim() } : {}),
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
          return;
        }
        toast.toast({
          title: "WhatsApp connected",
          description: "The configuration is saved and the integration is active.",
          variant: "success",
        });
        setOpen(false);
        setApiKey("");
        setPhoneNumber("");
        setWebhookUrl("");
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setSaving(false);
      }
    })();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          {/* R57-C: REF's verbatim title class (the standard shadcn recipe
              — the clone's R34-C base drops tracking-tight; this dialog
              carries it to match REF's measured class string). */}
          <DialogTitle className="tracking-tight">Configure WhatsApp API</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="wa-api-key">API Key</Label>
            <Input
              id="wa-api-key"
              placeholder="Enter your WhatsApp API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa-phone">Phone Number (with country code)</Label>
            <Input
              id="wa-phone"
              placeholder="+966XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa-webhook">Webhook URL (Optional)</Label>
            <Input
              id="wa-webhook"
              type="url"
              placeholder="https://your-webhook.com"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              maxLength={300}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> : null}
              Save Configuration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
