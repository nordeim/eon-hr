"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleUser, Facebook, Github, KeyRound, Linkedin, Loader2, Lock, Save, Share2, SlidersHorizontal, Trash2, Twitter, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, PageHeaderMobileKicker } from "@/components/shared/page-header";
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
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  facebookUrl?: string | null;
}

interface NotificationPrefs {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
}

export default function ProfilePage() {
  const toast = useToast();
  const router = useRouter();
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
  /* Session 57 (R57-D): the Connected Accounts form — REF's four URL
   * fields, persisted to the User record via PATCH /api/profile. */
  const [socialForm, setSocialForm] = React.useState({ linkedinUrl: "", twitterUrl: "", githubUrl: "", facebookUrl: "" });
  const [savingSocial, setSavingSocial] = React.useState(false);
  /* Session 57 (R57-E): the Danger Zone's DELETE-typed confirmation. */
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [pwForm, setPwForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = React.useState(false);
  const [notifPrefs, setNotifPrefs] = React.useState<NotificationPrefs | null>(null);
  const [savingNotifPrefs, setSavingNotifPrefs] = React.useState(false);

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
          setSocialForm({
            linkedinUrl: json.data.profile.linkedinUrl ?? "",
            twitterUrl: json.data.profile.twitterUrl ?? "",
            githubUrl: json.data.profile.githubUrl ?? "",
            facebookUrl: json.data.profile.facebookUrl ?? "",
          });
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
            pushEnabled: json.data.preferences.pushEnabled,
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

  /* Session 57 (R57-D): Save Accounts — the four URLs persist to the
   * User record (REF renders the form; the clone makes it stick). */
  async function onSaveAccounts() {
    setSavingSocial(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: socialForm.linkedinUrl.trim(),
          twitterUrl: socialForm.twitterUrl.trim(),
          githubUrl: socialForm.githubUrl.trim(),
          facebookUrl: socialForm.facebookUrl.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return;
      }
      setProfile(json.data.profile);
      toast.toast({ title: "Accounts saved", description: "Your social profiles are up to date.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSavingSocial(false);
    }
  }

  /* Session 57 (R57-E): Save Preferences — the two notification rows
   * persist as one PATCH (REF's submit affordance, made to stick). */
  async function onSaveNotificationPrefs() {
    if (!notifPrefs) return;
    setSavingNotifPrefs(true);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailEnabled: notifPrefs.emailEnabled,
          pushEnabled: notifPrefs.pushEnabled,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Preferences saved", description: "Your notification settings are up to date.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSavingNotifPrefs(false);
    }
  }

  /* Session 57 (R57-E): the account deletion — the DELETE-typed gate,
   * the API walk, then the sign-out + the login redirect. */
  function onDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    void (async () => {
      try {
        const res = await fetch("/api/profile", { method: "DELETE" });
        const json = await res.json();
        if (!json.ok) {
          toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
          setDeleting(false);
          return;
        }
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
        setDeleting(false);
      }
    })();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      {/* Session 89 (R89-E): the kicker HOISTED out of the content column —
       * the REF's profile tree renders it as the page root's direct child
       * (p-4 > [kicker, max-w-5xl > [hero…]]), unlike every other kicker
       * page. Inside the space-y-8 column it became the first child and
       * the 32px space-y gap below it offset the whole page at mobile
       * (the avatar at y=383 vs the REF's 351). */}
      <PageHeaderMobileKicker
        title="Profile"
        subtitle="Manage your account"
        back
        /* Session 61 (R61-O) → session 63 (R63-C): REF's profile kicker
           subtitle is the FLIPPING pair — slate-500 (rgb(100,116,139))
           in light, slate-400 (rgb(148,163,184)) in dark. The r61-O pin
           froze slate-400 from the dark census alone (the r63 light
           census + the 390×844 mobile re-measure caught the light side;
           the other kickers stay slate-500 both themes). */
        subtitleClassName="text-slate-500 dark:text-slate-400"
      />
      <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row).
         *  Live-measured @1440×900 this round. */
        bare
        section="My Profile"
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
          blue-700 border-blue-200, 53x22, vertically centered).
          Session 62 (R62-D2/R62-I): the card + border-slate-200 (the
          unflipping pair) + the badge is a DIV with REF's member set
          (the r62 border census — the span/shrink-0 retired; the text
          stays the seed's role — the documented data allowance). */}
      <Card className="border-slate-200">
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
                  {savingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="mr-2" aria-hidden="true" />}
                  Change Photo
                </Button>
              </div>
              {/* Session 62 (R62-I): REF's badge is a DIV (the r62 border
                  census reads tag|color sets — the span diverged). */}
              <div className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "User"}
              </div>
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
          {/* Session 88 (R88-F): the REF's tab glyph set (live-measured, 3/3
          reload-stable): General=circle-user, Social=share2 — the
          user/globe pair was a clone invention. */}
          <TabsTrigger value="general"><CircleUser className="h-4 w-4 mr-2" aria-hidden="true" />General</TabsTrigger>
          <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" aria-hidden="true" />Security</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="h-4 w-4 mr-2" aria-hidden="true" />Social Accounts</TabsTrigger>
          <TabsTrigger value="preferences"><SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />Preferences</TabsTrigger>
        </TabsList>

        {/* General tab — Personal Information form (reference recipe).
            Session 62 (R62-D2): + border-slate-200 (the unflipping pair). */}
        <TabsContent value="general" className="mt-0">
          <Card className="border-slate-200">
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
                {/* Session 58 (R58-2): REF's profile action buttons are the
                    DARK solid (bg-primary #171717, h-9) on every tab —
                    Save Changes / Save Accounts / Save Preferences /
                    Update Password (live-measured, the CTA-fill census). */}
                <div className="flex justify-end">
                  <Button type="submit" variant="dark" form="profile-form" disabled={savingProfile || loading}>
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2" aria-hidden="true" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session 57 (R57-E): the Preferences tab — REF's verbatim
            two-card recipe (live-measured): the Notification Preferences
            card (the two bg-slate-50 toggle rows + Save Preferences) and
            the Danger Zone card (the red frame + Delete My Account → the
            DELETE-typed confirmation dialog). The old language/timezone
            "General Settings" card was the R14-E copy-paste artifact —
            REF has no language/timezone card anywhere on /profile —
            removed this round (the duplicate value="preferences"
            structural fix). */}
        <TabsContent value="preferences" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                {/* R57-E: REF's verbatim title recipe for this panel — a
                    plain div, font-semibold leading-none tracking-tight
                    (NOT the app-wide CardTitle text-base pattern; the
                    live-measured class string). */}
                <div className="font-semibold leading-none tracking-tight">Notification Preferences</div>
              </CardHeader>
              <CardContent className="p-6">
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void onSaveNotificationPrefs();
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Email Notifications</h4>
                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifPrefs?.emailEnabled ?? true}
                        onCheckedChange={(v) =>
                          notifPrefs && setNotifPrefs({ ...notifPrefs, emailEnabled: v })
                        }
                        aria-label="Email notifications"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Push Notifications</h4>
                        <p className="text-sm text-slate-500">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        checked={notifPrefs?.pushEnabled ?? true}
                        onCheckedChange={(v) =>
                          notifPrefs && setNotifPrefs({ ...notifPrefs, pushEnabled: v })
                        }
                        aria-label="Push notifications"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="dark" disabled={savingNotifPrefs}>
                      {savingNotifPrefs ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                      )}
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-red-200 dark:border-red-900">
                {/* R57-E: REF's verbatim Danger Zone header — the plain-div
                    title with the red pair, NO description line. */}
                <div className="font-semibold leading-none tracking-tight text-red-600 dark:text-red-400">Danger Zone</div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Delete Account</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* R57-E: REF's DELETE-typed confirmation dialog (verbatim). */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="tracking-tight text-red-600">Delete Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div
                  role="alert"
                  className="relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <div className="text-sm [&_p]:leading-relaxed text-red-800 dark:text-red-400">
                    <p>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">Type &quot;DELETE&quot; to confirm</Label>
                  <Input
                    id="delete-confirm"
                    placeholder="DELETE"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onDeleteAccount}
                    disabled={deleteConfirm !== "DELETE" || deleting}
                  >
                    {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> : null}
                    Delete Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                <Button type="submit" variant="dark" form="password-form" disabled={savingPw}>
                  {savingPw ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="mr-2" aria-hidden="true" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session 57 (R57-D): the Social Accounts tab — REF's verbatim
            "Connected Accounts" card (live-measured): the four
            icon-tile/label/input rows and the Save Accounts footer. The
            old Google/Microsoft/Slack "Connect" row list was invented
            (never REF-measured) — removed. The save persists the URLs to
            the User record (the superset). */}
        <TabsContent value="social" className="mt-0">
          <Card>
            <CardHeader>
              {/* R57-D: REF's verbatim header — the plain-div title
                  (font-semibold leading-none tracking-tight), NO
                  description line. */}
              <div className="font-semibold leading-none tracking-tight">Connected Accounts</div>
            </CardHeader>
            <CardContent className="p-6">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onSaveAccounts();
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Linkedin className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="social-linkedin">LinkedIn Profile</Label>
                      <Input
                        id="social-linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={socialForm.linkedinUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, linkedinUrl: e.target.value })}
                        maxLength={300}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                      <Twitter className="w-6 h-6 text-sky-600" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="social-twitter">Twitter Profile</Label>
                      <Input
                        id="social-twitter"
                        placeholder="https://twitter.com/yourusername"
                        value={socialForm.twitterUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, twitterUrl: e.target.value })}
                        maxLength={300}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Github className="w-6 h-6 text-slate-700" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="social-github">GitHub Profile</Label>
                      <Input
                        id="social-github"
                        placeholder="https://github.com/yourusername"
                        value={socialForm.githubUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, githubUrl: e.target.value })}
                        maxLength={300}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Facebook className="w-6 h-6 text-blue-700" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="social-facebook">Facebook Profile</Label>
                      <Input
                        id="social-facebook"
                        placeholder="https://facebook.com/yourprofile"
                        value={socialForm.facebookUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, facebookUrl: e.target.value })}
                        maxLength={300}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="dark" disabled={savingSocial}>
                    {savingSocial ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                    )}
                    Save Accounts
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences tab — R57-E above */}
      </Tabs>
      {/* Session 49 (R48-G1): the stray wrap-level footer P (an icon-only
          CheckCircle2 with no text — cruft REF lacks, live-measured this
          round) — removed. */}
    </div>
    </div>
  );
}
