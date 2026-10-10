"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Loader2, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/ui/toast";

interface SecuritySettings {
  twoFactorAuth: boolean;
  auditLogging: boolean;
  dataEncryption: boolean;
  automatedBackups: boolean;
  gdprCompliance: boolean;
}

const FEATURE_ROWS: { key: keyof SecuritySettings; label: string }[] = [
  { key: "twoFactorAuth", label: "Two-Factor Authentication" },
  { key: "auditLogging", label: "Audit Logging" },
  { key: "dataEncryption", label: "Data Encryption" },
  { key: "automatedBackups", label: "Automated Backups" },
  { key: "gdprCompliance", label: "GDPR Compliance" },
];

const RECOMMENDATIONS = [
  // Session 12 (R11-S): the reference's compact recommendation lines —
  // "Title: description" with a <strong> title prefix, 20px check icon.
  {
    title: "Two-Factor Authentication",
    text: "Two-Factor Authentication: Adds an extra layer of security for user logins.",
  },
  {
    title: "Audit Logging",
    text: "Audit Logging: Tracks all user actions and system changes for accountability and compliance.",
  },
  {
    title: "Data Encryption",
    text: "Data Encryption: Encrypts sensitive data at rest and in transit to protect employee information.",
  },
  {
    title: "Automated Backups",
    text: "Automated Backups: Scheduled backups keep your HR data safe and recoverable.",
  },
  {
    title: "GDPR Compliance",
    text: "GDPR Compliance: Tools and policies that help you meet GDPR requirements.",
  },
];

export default function SecuritySettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = React.useState<SecuritySettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/security-settings");
        const json = await res.json();
        if (json.ok) setSettings(json.data.settings);
        else toast.toast({ title: "Failed to load security settings", description: json.error?.message, variant: "error" });
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/security-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return;
      }
      setSettings(json.data.settings);
      toast.toast({ title: "Security settings saved", description: "Your configuration is up to date.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const bannerVisible = settings !== null && !settings.twoFactorAuth;

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        section="Security Configuration"
        layout="flat36"
        iconClassName="text-blue-600"
        sectionIcon={<Shield aria-hidden="true" />}
        title="Security Settings"
        subtitle="Configure security settings for your HR system"
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <>
          {bannerVisible ? (
            /* Session 12 (R11-S): the reference's alert — border-2
               border-orange-500 bg-orange-50, p-6, flex items-center gap-4
               with a 48px bare orange icon (no tile). */
            <div className="rounded-xl text-card-foreground shadow border-2 border-orange-500 bg-orange-50">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-12 w-12 shrink-0 text-orange-500" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-orange-700">Security Configuration Required</p>
                    <p className="text-sm text-orange-600">
                      Please enable all required security features to publish your app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <Card className="border-slate-200">
            {/* Session 12 (R11-S): border-b DIV-title CardHeader
                ("Security Features", 65px); rows are p-4 bg-slate-50
                rounded-lg with a checkbox + text-base font-medium label
                (56px) and the Enabled/Disabled badge; footer is the
                border-t justify-end row with the h-9 save button. */}
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
              <div className="font-semibold leading-none tracking-tight">Security Features</div>
            </div>
            <CardContent className="p-6">
              {settings === null ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : (
                <div className="space-y-6">
                  {FEATURE_ROWS.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={settings[row.key]}
                          onCheckedChange={(v) => setSettings({ ...settings, [row.key]: v === true })}
                          id={`sec-${row.key}`}
                        />
                        <label
                          htmlFor={`sec-${row.key}`}
                          className="text-base font-medium cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {row.label}
                        </label>
                      </div>
                      <Badge variant={settings[row.key] ? "success" : "secondary"}>
                        {settings[row.key] ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                <Button onClick={onSave} disabled={saving || settings === null}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
              <div className="font-semibold leading-none tracking-tight">Security Recommendations</div>
            </div>
            <CardContent className="p-6">
              {/* Session 12 (R11-S): the compact space-y-3 text-sm
                  slate-600 list — 20px check icon + <strong>-prefixed
                  line, one line each. */}
              <div className="space-y-3 text-sm text-slate-600">
                {RECOMMENDATIONS.map((r) => (
                  <div key={r.title} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <p>
                      <strong>{r.title}:</strong> {r.text.slice(r.title.length + 2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
    </div>
  );
}
