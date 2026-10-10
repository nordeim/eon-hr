"use client";

import * as React from "react";
import { Loader2, ArrowLeft, ArrowRight, User, UserPlus, Briefcase, FileText, Paperclip, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Fields the wizard round-trips in edit mode (ISO date strings or null). */
export interface WizardEmployee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  departmentId: string | null;
  managerId: string | null;
  employmentType: string;
  startDate: string | null;
  privateEmail: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  nationalId: string | null;
  iqamaNumber: string | null;
  iqamaExpiry: string | null;
  contractType: string | null;
  contractStart: string | null;
  bankName: string | null;
  iban: string | null;
  gosiNumber: string | null;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface TemplateOption {
  id: string;
  title: string;
}

const STEPS = [
  "Personal Information",
  "Job Information",
  "Contract Information",
  "Documents & Attachments",
] as const;

/** Step-rail icons decoded from the reference wizard's inline SVGs (session 7). */
const STEP_ICONS = [User, Briefcase, FileText, Paperclip] as const;

const GENDER_OPTIONS = ["male", "female"] as const;
const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "intern"] as const;
const CONTRACT_TYPES = ["indefinite", "fixed_term"] as const;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  privateEmail: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Saudi Arabia",
  nationalId: "",
  iqamaNumber: "",
  iqamaExpiry: "",
  jobTitle: "",
  departmentId: "",
  employmentType: "full_time",
  startDate: "",
  managerId: "",
  contractType: "indefinite",
  contractStart: "",
  bankName: "",
  iban: "",
  gosiNumber: "",
  onboardingTemplateId: "",
};

type FormState = typeof EMPTY_FORM;

function isoDate(v: string | null | undefined): string {
  return v ? v.slice(0, 10) : "";
}

function prefilledForm(employee: WizardEmployee | null): FormState {
  if (!employee) return { ...EMPTY_FORM };
  // Edit mode: rejoin first/last into the single Full Name field.
  return {
    firstName: `${employee.firstName} ${employee.lastName ?? ""}`.trim(),
    lastName: "",
    email: employee.email ?? "",
    privateEmail: employee.privateEmail ?? "",
    phone: employee.phone ?? "",
    dateOfBirth: isoDate(employee.dateOfBirth),
    gender: employee.gender ?? "",
    nationality: employee.nationality ?? "",
    nationalId: employee.nationalId ?? "",
    iqamaNumber: employee.iqamaNumber ?? "",
    iqamaExpiry: isoDate(employee.iqamaExpiry),
    jobTitle: employee.jobTitle ?? "",
    departmentId: employee.departmentId ?? "",
    employmentType: employee.employmentType ?? "full_time",
    startDate: isoDate(employee.startDate),
    managerId: employee.managerId ?? "",
    contractType: employee.contractType ?? "indefinite",
    contractStart: isoDate(employee.contractStart),
    bankName: employee.bankName ?? "",
    iban: employee.iban ?? "",
    gosiNumber: employee.gosiNumber ?? "",
    onboardingTemplateId: "",
  };
}

/**
 * Add/Edit Employee wizard — 4-step INLINE view (session 7, R6-C):
 *   1. Personal Information (name, emails, phone, DOB, gender, nationality,
 *      national ID, iqama number + expiry)
 *   2. Job Information (job title, department, employment type, start date,
 *      manager)
 *   3. Contract Information (contract type, contract start, bank, IBAN, GOSI)
 *   4. Documents & Attachments (optional onboarding template, upload
 *      placeholder)
 *
 * The reference renders this as a page-replacing view — NOT a modal: a back
 * button (outline, ArrowLeft, 36×36) beside a 30px/700 h1 + 16px slate-500
 * subtitle, then a `max-w-4xl mx-auto` rounded-xl card with a `p-8`
 * interior (all live-measured; docs/remediation-plan-session7.md §R6-C).
 * The step rail is a horizontal `flex items-center justify-between mb-8`
 * row of 48px icon circles (active bg-blue-600, inactive bg-slate-200,
 * white 24px icons) with 14px/500 labels below and h-0.5 mx-4 connectors
 * that turn bg-green-600 once passed. Cancel/Back (outline) + Next/Create
 * (gradient CTA) footer, all type="button" (AP-5).
 *
 * The component mounts per wizard session — the parent renders it
 * conditionally and resets it via the `key` prop.
 */
export function EmployeeWizard({
  employee,
  excludeManagerId,
  onClose,
  onSave,
}: {
  employee: WizardEmployee | null;
  excludeManagerId: string | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormState>(() => prefilledForm(employee));
  const [saving, setSaving] = React.useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [photoName, setPhotoName] = React.useState<string | null>(null);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [managers, setManagers] = React.useState<{ id: string; name: string }[]>([]);
  const [templates, setTemplates] = React.useState<TemplateOption[]>([]);

  // Load wizard reference data (departments, manager candidates, templates)
  // once per wizard session.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [deptRes, empRes, tplRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/employees"),
          fetch("/api/onboarding-templates"),
        ]);
        const [deptJson, empJson, tplJson] = await Promise.all([deptRes.json(), empRes.json(), tplRes.json()]);
        if (cancelled) return;
        if (deptJson.ok) setDepartments(deptJson.data.departments);
        if (empJson.ok)
          setManagers(
            (empJson.data.employees as { id: string; firstName: string; lastName: string }[])
              .filter((e) => e.id !== excludeManagerId)
              .map((e) => ({ id: e.id, name: `${e.firstName} ${e.lastName}`.trim() }))
          );
        if (tplJson.ok) setTemplates(tplJson.data.templates);
      } catch {
        /* dropdowns stay empty; the wizard still works */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [excludeManagerId]);

  const stepValid = React.useCallback(
    (s: number): boolean => {
      if (s === 0) return form.firstName.trim() !== "" && /.+@.+\..+/.test(form.email.trim());
      if (s === 1) return form.jobTitle.trim() !== "" && form.startDate.trim() !== "";
      return true;
    },
    [form]
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // NOTE: the footer buttons are ALL type="button" and submit via onClick.
  // Swapping a type="submit" button into the DOM position a type="button"
  // just vacated (Next → Create Employee) causes Chromium to resolve the
  // form's *current* default button when the click's default action runs —
  // after React's synchronous re-render — and submit the form one step
  // early. Driving the submit from onClick removes that entire failure
  // class; onSubmit remains wired for Enter-key implicit submission.
  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (saving || step < STEPS.length - 1) return;
    setSaving(true);
    try {
      // The reference collects a single "Full Name"; the data model stores
      // first/last — split on the first space (single-word names keep the
      // whole string as firstName with a "." lastName placeholder).
      const fullName = form.firstName.trim();
      const spaceAt = fullName.indexOf(" ");
      const first = spaceAt > 0 ? fullName.slice(0, spaceAt) : fullName;
      const last = spaceAt > 0 ? fullName.slice(spaceAt + 1).trim() : ".";
      const payload: Record<string, unknown> = {
        firstName: first,
        lastName: last,
        email: form.email.trim(),
        privateEmail: form.privateEmail.trim(),
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        nationality: form.nationality.trim(),
        nationalId: form.nationalId.trim(),
        iqamaNumber: form.iqamaNumber.trim(),
        iqamaExpiry: form.iqamaExpiry,
        jobTitle: form.jobTitle.trim(),
        departmentId: form.departmentId,
        employmentType: form.employmentType,
        employmentStatus: "active",
        startDate: form.startDate,
        managerId: form.managerId,
        contractType: form.contractType,
        contractStart: form.contractStart || form.startDate,
        bankName: form.bankName.trim(),
        iban: form.iban.trim(),
        gosiNumber: form.gosiNumber.trim(),
        baseSalary: 0,
      };
      if (!employee && form.onboardingTemplateId) {
        payload.onboardingTemplateId = form.onboardingTemplateId;
      }
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Reference header row: outline ArrowLeft back button (36×36) beside
          the bare-page h1 (30px/700) + 16px slate-500 subtitle. */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Back to employees"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {employee ? "Edit Employee" : "Add New Employee"}
          </h1>
          <p className="mt-1 text-base text-slate-500">Add a new team member</p>
        </div>
      </div>

      {/* The wizard card (reference: max-w-4xl mx-auto, rounded-xl border
          bg-card border-slate-200, p-8 interior; a gradient card header
          (blue-50→indigo-50, border-b) carries the UserPlus title row). */}
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 border-b border-slate-200 bg-[linear-gradient(to_right,#eff6ff,#eef2ff)] p-6">
          <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-card-foreground">
            <UserPlus className="h-6 w-6 text-blue-600" aria-hidden="true" />
            {employee ? "Edit Employee" : "Add New Employee"}
          </div>
        </div>
        <div className="p-8">
          {/* Step rail — reference: flex items-center justify-between mb-8
              with 48px icon circles and h-0.5 mx-4 connectors. */}
          <div className="mb-8 flex items-center justify-between">
            {STEPS.map((label, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "mb-2 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                        i === step ? "bg-blue-600" : "bg-slate-200"
                      )}
                      aria-current={i === step ? "step" : undefined}
                    >
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        i === step ? "text-blue-600" : "text-slate-500"
                      )}
                    >
                      {label}
                    </p>
                  </div>
                  {i < STEPS.length - 1 ? (
                    <span
                      className={cn(
                        "h-0.5 mx-4 flex-1",
                        i < step ? "bg-green-600" : "bg-slate-200"
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>

          <form onSubmit={submit}>
            <div className="space-y-6">
              {step === 0 ? (
                <>
                  {/* Photo upload (reference: 96px slate-100 circle with a
                      48px User icon + a 32px camera button pinned to its
                      bottom-right corner; the file input itself is hidden). */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                        <User className="h-12 w-12 text-slate-400" aria-hidden="true" />
                      </div>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        aria-label="Upload employee photo"
                        onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
                      />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border bg-white"
                        aria-label="Upload photo"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {photoName ? (
                    <p className="text-center text-xs text-muted-foreground" aria-live="polite">
                      {photoName}
                    </p>
                  ) : null}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field id="w-fullname" label="Full Name" required>
                    <Input id="w-fullname" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                  </Field>
                  <Field id="w-email" label="Work Email" required>
                    <Input id="w-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                  <Field id="w-private" label="Private Email">
                    <Input id="w-private" type="email" value={form.privateEmail} onChange={(e) => set("privateEmail", e.target.value)} />
                  </Field>
                  <Field id="w-phone" label="Phone Number">
                    <Input id="w-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </Field>
                  <Field id="w-dob" label="Date of Birth">
                    <Input id="w-dob" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                  </Field>
                  <Field id="w-gender" label="Gender">
                    <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                      <SelectTrigger id="w-gender">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="w-nationality" label="Nationality">
                    <Input id="w-nationality" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
                  </Field>
                  <Field id="w-natid" label="National ID">
                    <Input id="w-natid" value={form.nationalId} onChange={(e) => set("nationalId", e.target.value)} />
                  </Field>
                  <Field id="w-iqama" label="Iqama Number">
                    <Input id="w-iqama" value={form.iqamaNumber} onChange={(e) => set("iqamaNumber", e.target.value)} />
                  </Field>
                  <Field id="w-iqama-exp" label="Iqama Expiry">
                    <Input id="w-iqama-exp" type="date" value={form.iqamaExpiry} onChange={(e) => set("iqamaExpiry", e.target.value)} />
                  </Field>
                </div>
                </>
              ) : step === 1 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field id="w-title" label="Job Title" required>
                    <Input id="w-title" required value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
                  </Field>
                  <Field id="w-dept" label="Department">
                    <Select value={form.departmentId} onValueChange={(v) => set("departmentId", v)}>
                      <SelectTrigger id="w-dept">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="w-type" label="Employment Type">
                    <Select value={form.employmentType} onValueChange={(v) => set("employmentType", v)}>
                      <SelectTrigger id="w-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="w-start" label="Start Date" required>
                    <Input id="w-start" type="date" required value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                  </Field>
                  <Field id="w-manager" label="Manager" className="sm:col-span-2">
                    <Select value={form.managerId} onValueChange={(v) => set("managerId", v)}>
                      <SelectTrigger id="w-manager">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              ) : step === 2 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field id="w-contract-type" label="Contract Type">
                    <Select value={form.contractType} onValueChange={(v) => set("contractType", v)}>
                      <SelectTrigger id="w-contract-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRACT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t === "indefinite" ? "Indefinite" : "Fixed Term"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="w-contract-start" label="Contract Start Date">
                    <Input id="w-contract-start" type="date" value={form.contractStart} onChange={(e) => set("contractStart", e.target.value)} />
                  </Field>
                  <Field id="w-bank" label="Bank Name">
                    <Input id="w-bank" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} />
                  </Field>
                  <Field id="w-iban" label="IBAN">
                    <Input id="w-iban" value={form.iban} onChange={(e) => set("iban", e.target.value)} />
                  </Field>
                  <Field id="w-gosi" label="GOSI Number" className="sm:col-span-2">
                    <Input id="w-gosi" value={form.gosiNumber} onChange={(e) => set("gosiNumber", e.target.value)} />
                  </Field>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Field id="w-template" label="Onboarding Template (Optional)">
                    <Select value={form.onboardingTemplateId} onValueChange={(v) => set("onboardingTemplateId", v)}>
                      <SelectTrigger id="w-template">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center">
                    <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">Upload Documents</p>
                    <p className="text-xs text-muted-foreground">
                      Attach employment contracts, ID copies, or certificates (PDF, JPG, PNG)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reference footer: flex justify-between mt-8 pt-6 with a
                border-t separator above the buttons. */}
            <div className="mt-8 flex justify-between border-t border-slate-200 pt-6">
              {step === 0 ? (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              <Button
                type="button"
                disabled={saving || !stepValid(step)}
                onClick={() => {
                  if (step < STEPS.length - 1) {
                    setStep((s) => s + 1);
                    return;
                  }
                  void submit();
                }}
              >
                {saving && step === STEPS.length - 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {step < STEPS.length - 1 ? "Next" : employee ? "Save Changes" : "Create Employee"}
                {/* Reference (session 8, R7-B): the advancing CTA carries a
                    trailing arrow-right (w-4 h-4 ml-2) — 97px Next vs 65px
                    without it. */}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  // Reference wizard field (measured, session 8 R7-C): wrapper 68px = 4px
  // top slack (pt-1) + 16px label box (leading-4) + 12px gap (gap-3, kept
  // as flex-gap — trap 4: never mt/mb inside space-y containers) + 36px
  // input → 84px row pitch under gap-4 grids, card 872px like the ref.
  return (
    <div className={cn("flex flex-col gap-3 pt-1", className)}>
      <Label htmlFor={id} className="leading-4">
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}
