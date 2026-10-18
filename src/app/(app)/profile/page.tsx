"use client";

import * as React from "react";
import { Camera, CheckCircle2, CircleUser, Globe, KeyRound, Loader2, Lock, Plug, Save, SlidersHorizontal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { initials } from "@/lib/utils";

interface ProfileInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

interface FormPreferences {
  language?: string;
  timezone?: string;
}

interface NotificationPrefs {
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

const LANGUAGES = ["English", "العربية (Arabic)", "Français", "Español", "Deutsch"];

const TIMEZONES = [
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

const LANG_KEY = "eon.profile.language";
const TZ_KEY = "eon.profile.timezone";

export default function ProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = React.useState<ProfileInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  /* Session 49 (R48-F1): the WORKING avatar upload — REF renders the same
   *  Change Photo button + hidden input (R46-F1) but the clone's flow
   *  actually persists: click → file → 96×96 canvas downscale → POST
   *  /api/profile/avatar → optimistic swap (the functional superset). */
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [savingAvatar, setSavingAvatar] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", jobTitle: "" });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [language, setLanguage] = React.useState("English");
  const [timezone, setTimezone] = React.useState("Asia/Riyadh");
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [pwForm, setPwForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = React.useState(false);
  const [notifPrefs, setNotifPrefs] = React.useState<NotificationPrefs | null>(null);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json.ok) {
          setProfile(json.data.profile);
          setForm({
            name: json.data.profile.name ?? "",
            email: json.data.profile.email ?? "",
            phone: json.data.profile.phone ?? "",
            jobTitle: json.data.profile.jobTitle ?? "",
          });
          const prefs: FormPreferences = json.data.preferences ?? {};
          setLanguage(prefs.language ?? window.localStorage.getItem(LANG_KEY) ?? "English");
          setTimezone(prefs.timezone ?? window.localStorage.getItem(TZ_KEY) ?? "Asia/Riyadh");
        } else {
          toast.toast({ title: "Failed to load profile", description: json.error?.message, variant: "error" });
        }
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Session 49 (R48-F1): the avatar flow — read the picked file, draw it
   *  onto a 96×96 canvas (center-cropped square, JPEG 0.85 — a few KiB),
   *  POST the data URL, and swap the avatar OPTIMISTICALLY on success.
   *  Rejects non-images + files that fail to decode. */
  const onPickAvatar = React.useCallback(
    async (file: File | undefined) => {
      if (!file || !profile) return;
      if (!file.type.startsWith("image/")) {
        toast.toast({ title: "Change Photo", description: "Please choose an image file.", variant: "error" });
        return;
      }
      setSavingAvatar(true);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            try {
              const SIZE = 96;
              const canvas = document.createElement("canvas");
              canvas.width = SIZE;
              canvas.height = SIZE;
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("no 2d context");
              const side = Math.min(img.naturalWidth, img.naturalHeight);
              const sx = (img.naturalWidth - side) / 2;
              const sy = (img.naturalHeight - side) / 2;
              ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
              URL.revokeObjectURL(url);
              resolve(canvas.toDataURL("image/jpeg", 0.85));
            } catch (e) {
              URL.revokeObjectURL(url);
              reject(e);
            }
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("decode failed"));
          };
          img.src = url;
        });
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: dataUrl }),
        });
        const json = await res.json();
        if (json.ok) {
          setProfile({ ...profile, avatarUrl: json.data.avatarUrl });
          toast.toast({ title: "Photo updated", variant: "success" });
        } else {
          toast.toast({ title: "Change Photo", description: json.error?.message, variant: "error" });
        }
      } catch {
        toast.toast({ title: "Change Photo", description: "Could not read that image.", variant: "error" });
      } finally {
        setSavingAvatar(false);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
      }
    },
    [profile, toast]
  );

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/notification-preferences");
        const json = await res.json();
        if (json.ok) {
          setNotifPrefs({
            emailEnabled: json.data.preferences.emailEnabled,
            inAppEnabled: json.data.preferences.inAppEnabled,
          });
        }
      } catch {
        // non-critical
      }
    })();
  }, []);

  async function onSaveProfile() {
    if (!form.name.trim()) {
      toast.toast({ title: "Name is required", variant: "info" });
      return;
    }
    if (!form.email.trim()) {
      toast.toast({ title: "Email is required", variant: "info" });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          jobTitle: form.jobTitle.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return;
      }
      setProfile(json.data.profile);
      toast.toast({ title: "Profile updated", description: "Your personal information is saved.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSavePreferences() {
    setSavingPrefs(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { language, timezone } }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return;
      }
      window.localStorage.setItem(LANG_KEY, language);
      window.localStorage.setItem(TZ_KEY, timezone);
      toast.toast({ title: "Preferences saved", description: "Language and timezone updated.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSavingPrefs(false);
    }
  }

  async function onChangePassword() {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.toast({ title: "Fill in both passwords", variant: "info" });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "info" });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.toast({ title: "Passwords don't match", description: "New password and confirmation differ.", variant: "info" });
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Password change failed", description: json.error?.message, variant: "error" });
        return;
      }
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.toast({ title: "Password updated", description: "Use your new password next time you sign in.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSavingPw(false);
    }
  }

  async function onToggleNotif(key: keyof NotificationPrefs, value: boolean) {
    if (!notifPrefs) return;
    const next = { ...notifPrefs, [key]: value };
    setNotifPrefs(next);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const json = await res.json();
      if (!json.ok) {
        setNotifPrefs(notifPrefs);
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
      }
    } catch {
      setNotifPrefs(notifPrefs);
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row).
         *  Live-measured @1440×900 this round. */
        bare
        section="My Profile"
        mobileKicker
        mobileKickerTitle="Profile"
        mobileKickerBack
        mobileKickerSubtitle="Manage your account"
        layout="flat48"
        iconClassName="text-blue-600"
        sectionIcon={<CircleUser aria-hidden="true" />}
        title="Profile Settings"
        subtitle="Manage your personal information and preferences"
      />

      {/* identity header — Session 11 (R10-M): the reference's recipe —
          CardContent p-6 > `flex items-center gap-6`: the 96px gradient
          circle (sRGB-pinned — the reference's bg-gradient-to-br renders
          sRGB in its v3 engine) carrying the 64px white circle-user ICON
          (not initials), the flex-1 column (h2 text-2xl name, email
          text-slate-600 mb-3, the Change Photo button 164x36 BELOW the
          email), and the "User" role badge pinned right (blue-50 text
          blue-700 border-blue-200, 53x22, vertically centered). */}
      <Card>
        <CardContent className="p-6">
          {loading || !profile ? (
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="h-6 w-40 animate-pulse rounded bg-secondary" />
                <div className="h-4 w-56 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex w-24 h-24 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(to_bottom_right,#3b82f6,#6366f1)]">
                {profile.avatarUrl ? (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  </Avatar>
                ) : (
                  <CircleUser className="h-16 w-16 text-white" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                <p className="mb-3 truncate text-slate-600">{profile.email}</p>
                {/* Session 47 (R46-F1): REF renders the hidden avatar file
                    input here (id=avatar, accept=image/*) — the Change Photo
                    button's real target on the reference.
                    Session 49 (R48-F1): the clone's flow WORKS — the ref +
                    the click + the canvas downscale + the POST + the
                    optimistic swap (functional superset). */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  id="avatar"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onPickAvatar(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {savingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="mr-2" aria-hidden="true" />}
                  Change Photo
                </Button>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "User"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session 14 (R13-C): the reference's profile tabs — exactly four
          (General/Security/Social Accounts/Preferences), iconed (16px svg,
          mr-2), in the DEFAULT shrink-wrapped TabsList with bg-white +
          border (507px). The General tab carries the Personal Information
          form: border-b DIV-title header + p-6 form (space-y-6 > grid
          md:grid-cols-2 gap-6 of space-y-2 fields) + the Save Changes
          button INSIDE the form (flex justify-end, iconed). */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="general"><User className="h-4 w-4 mr-2" aria-hidden="true" />General</TabsTrigger>
          <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" aria-hidden="true" />Security</TabsTrigger>
          <TabsTrigger value="social"><Globe className="h-4 w-4 mr-2" aria-hidden="true" />Social Accounts</TabsTrigger>
          <TabsTrigger value="preferences"><SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />Preferences</TabsTrigger>
        </TabsList>

        {/* General tab — Personal Information form (reference recipe) */}
        <TabsContent value="general" className="mt-0">
          <Card>
            <CardHeader className="border-b border-slate-200 p-6">
              <div className="font-semibold leading-none tracking-tight">Personal Information</div>
            </CardHeader>
            <CardContent className="p-6">
              <form
                id="profile-form"
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onSaveProfile();
                }}
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      className="mt-2"
                      id="full_name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {/* Session 56 (R56-B): REF renders the identity email
                        as a READ-ONLY field — a disabled input with an
                        authored bg-slate-50 (live-measured: disabled +
                        computed rgb(248,250,252)); the profile save still
                        carries the unchanged value, matching REF's
                        behavior (the identity email never edits here). */}
                    <Input
                      className="mt-2 bg-slate-50"
                      id="email"
                      type="email"
                      required
                      disabled
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {/* Session 56 (R56-C): no authored placeholder — REF
                        renders the empty phone field bare (live-measured:
                        value "" + placeholder ""). */}
                    <Input
                      className="mt-2"
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    {/* Session 56 (R56-C): no authored placeholder — REF
                        renders the empty job-title field bare. */}
                    <Input
                      className="mt-2"
                      id="job_title"
                      value={form.jobTitle}
                      onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" form="profile-form" disabled={savingProfile || loading}>
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2" aria-hidden="true" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences tab (session 15, R14-E): this card was mistakenly
            mounted under value="general" — a copy-paste bug from the R13-C
            rebuild that stacked it below the personal-information form and
            left the real "preferences" tab empty. */}
        <TabsContent value="preferences" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Language and timezone used across the app.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pf-language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="pf-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pf-timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="pf-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                Saved to your account and this browser.
              </p>
            </CardContent>
            <CardContent className="p-6 pt-0">
              <div className="flex justify-end">
                <Button onClick={onSavePreferences} disabled={savingPrefs}>
                  {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2" aria-hidden="true" />}
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Use a strong password you don't reuse elsewhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="password-form"
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onChangePassword();
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pw-current">Current Password</Label>
                  <Input
                    id="pw-current"
                    type="password"
                    autoComplete="current-password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pw-new">New Password</Label>
                    <Input
                      id="pw-new"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pw-confirm">Confirm New Password</Label>
                    <Input
                      id="pw-confirm"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardContent className="p-6 pt-0">
              <div className="flex justify-end">
                <Button type="submit" form="password-form" disabled={savingPw}>
                  {savingPw ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="mr-2" aria-hidden="true" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social accounts tab */}
        <TabsContent value="social" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Social Accounts</CardTitle>
              <CardDescription>Connect third-party accounts for one-click sign-in.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                { name: "Google", detail: "sepnetflix2023@outlook.com" },
                { name: "Microsoft", detail: "Not connected" },
                { name: "Slack", detail: "Not connected" },
              ].map((acct) => (
                <div
                  key={acct.name}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Plug className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{acct.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{acct.detail}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast.toast({
                        title: "Social sign-in coming soon",
                        description: `${acct.name} sign-in arrives in a future update.`,
                        variant: "info",
                      })
                    }
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences tab */}
        <TabsContent value="preferences" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Quick toggles for how we reach you.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {notifPrefs === null ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-secondary/40">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifPrefs.emailEnabled}
                      onCheckedChange={(v) => void onToggleNotif("emailEnabled", v)}
                      aria-label="Email notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-secondary/40">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">In-App Notifications</p>
                      <p className="text-xs text-muted-foreground">Show notification bell in the app</p>
                    </div>
                    <Switch
                      checked={notifPrefs.inAppEnabled}
                      onCheckedChange={(v) => void onToggleNotif("inAppEnabled", v)}
                      aria-label="In-app notifications"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Session 49 (R48-G1): the stray wrap-level footer P (an icon-only
          CheckCircle2 with no text — cruft REF lacks, live-measured this
          round) — removed. */}
    </div>
    </div>
  );
}
