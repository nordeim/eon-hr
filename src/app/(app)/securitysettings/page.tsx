"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Loader2, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Security Configuration"
        sectionIcon={<ShieldCheck aria-hidden="true" />}
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
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Security Configuration Required</p>
                <p className="text-sm text-amber-800">
                  Please enable all required security features to publish your app.
                </p>
              </div>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
              <CardDescription>Toggle the platform's security capabilities.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {settings === null ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : (
                FEATURE_ROWS.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-secondary/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="text-sm font-medium text-foreground">{row.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={settings[row.key] ? "success" : "secondary"}>
                        {settings[row.key] ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={settings[row.key]}
                        onCheckedChange={(v) => setSettings({ ...settings, [row.key]: v })}
                        aria-label={row.label}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={onSave} disabled={saving || settings === null}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>What each feature does for your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {RECOMMENDATIONS.map((r) => (
                <div key={r.title} className="flex items-start gap-3 rounded-lg border p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <p className="text-sm text-foreground">{r.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
