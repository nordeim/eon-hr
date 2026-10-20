"use client";

import * as React from "react";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

/**
 * The /tenantsetup orphan route — parity round 31 (R31-C10).
 *
 * REF serves this page (registry: TenantSetup): a blue→indigo-50 canvas
 * centering a max-w-2xl (672px) shadow card — border-b p-6 text-center
 * CardHeader ("Welcome to EonHR" + the 16px slate-600 line) + the
 * Company Name * / Owner Email * fields + the justify-end Continue
 * button (measured y=209/631, docs/remediation-plan-session32.md).
 * Superset: Continue PATCHes the Company profile.
 */
export default function TenantSetupPage() {
  const toast = useToast();
  const [form, setForm] = React.useState({ companyName: "", ownerEmail: "" });
  const [saving, setSaving] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.companyName.trim() || !form.ownerEmail.trim()) {
      toast.toast({ title: "Missing fields", description: "Company name and owner email are required.", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.companyName.trim(), email: form.ownerEmail.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Setup failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Workspace configured", description: "Your HR workspace is ready.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow">
        <CardHeader className="flex flex-col space-y-1.5 border-b p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <div className="font-semibold tracking-tight text-2xl">Welcome to EonHR</div>
          <p className="text-slate-600">Let&apos;s set up your HR management workspace</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              {/* Session 64 (R64-E): REF's live example placeholders
                  (live-measured this round — R31-C10 held the labels
                  only). */}
              <Input
                id="company-name"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                placeholder="Acme Corporation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-email">Owner Email *</Label>
              <Input
                id="owner-email"
                type="email"
                value={form.ownerEmail}
                onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
                placeholder="admin@acme.com"
                required
              />
            </div>
            <div className="flex pt-4">
              {/* Session 58 (R58-4): REF's Continue is the DARK solid
                  (bg-primary #171717) — live-measured, the CTA-fill census.
                  Session 66 (R66-J): the footer is NOT justify-end — REF's
                  button right-aligns via its own ml-auto (the census read
                  the resolved 527px left margin). */}
              <Button type="submit" variant="dark" className="ml-auto" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
