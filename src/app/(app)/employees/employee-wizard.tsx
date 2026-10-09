"use client";

import * as React from "react";
import { Loader2, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

/**
 * Add/Edit Employee dialog — 4-step wizard mirroring the reference app:
 *   1. Personal Information (name, emails, phone, DOB, gender, nationality,
 *      national ID, iqama number + expiry)
 *   2. Job Information (job title, department, employment type, start date,
 *      manager)
 *   3. Contract Information (contract type, contract start, bank, IBAN, GOSI)
 *   4. Documents & Attachments (optional onboarding template, upload
 *      placeholder)
 * Back / Next navigation with per-step required-field gating; step 1 also
 * exposes Cancel (reference behavior).
 */
export function EmployeeWizard({
  open,
  employee,
  excludeManagerId,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  employee: WizardEmployee | null;
  excludeManagerId: string | null;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [managers, setManagers] = React.useState<{ id: string; name: string }[]>([]);
  const [templates, setTemplates] = React.useState<TemplateOption[]>([]);

  // Reset to step 1 whenever the dialog opens; prefill for edit mode.
  React.useEffect(() => {
    if (!open) return;
    setStep(0);
    setForm(
      employee
        ? {
            // Edit mode: rejoin first/last into the single Full Name field.
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
          }
        : { ...EMPTY_FORM }
    );
  }, [open, employee]);

  // Load wizard reference data (departments, manager candidates, templates)
  // once per dialog session.
  React.useEffect(() => {
    if (!open) return;
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
  }, [open, excludeManagerId]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>Add a new team member</DialogDescription>
        </DialogHeader>

        {/* Step rail */}
        <ol className="flex items-center gap-2" aria-label="Wizard steps">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-xs font-medium sm:block",
                  i === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? <span className="h-px flex-1 bg-border" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="max-h-[55vh] overflow-y-auto pr-1">
            {step === 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            ) : step === 1 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <DialogFooter>
            {step === 0 ? (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}
