import { z } from "zod";

// Employee create/update payload — shared by POST and PATCH.
// Optional fields accept "" (form empty) and are normalized to null in the
// route. Date fields are ISO strings (YYYY-MM-DD from the wizard).
export const EmployeeInput = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
  department: z.string().trim().max(60).optional().or(z.literal("")),
  managerName: z.string().trim().max(120).optional().or(z.literal("")),
  employmentStatus: z.enum(["active", "on_leave", "suspended", "terminated"]).default("active"),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).default("full_time"),
  startDate: z.string().trim().optional().or(z.literal("")),
  baseSalary: z.number().int().min(0).max(1_000_000_000).default(0),
  // Wizard step 2 — job information (resolved to relations in the route)
  departmentId: z.string().trim().optional().or(z.literal("")),
  managerId: z.string().trim().optional().or(z.literal("")),
  // Wizard step 1 — personal information
  privateEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid private email")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  gender: z.enum(["male", "female"]).optional().or(z.literal("")),
  nationality: z.string().trim().max(60).optional().or(z.literal("")),
  nationalId: z.string().trim().max(30).optional().or(z.literal("")),
  iqamaNumber: z.string().trim().max(30).optional().or(z.literal("")),
  iqamaExpiry: z.string().trim().optional().or(z.literal("")),
  // Wizard step 3 — contract information
  contractType: z.enum(["indefinite", "fixed_term"]).optional().or(z.literal("")),
  contractStart: z.string().trim().optional().or(z.literal("")),
  bankName: z.string().trim().max(80).optional().or(z.literal("")),
  iban: z.string().trim().max(40).optional().or(z.literal("")),
  gosiNumber: z.string().trim().max(30).optional().or(z.literal("")),
  // Wizard step 4 — onboarding template (kicks off an OnboardingProcess)
  onboardingTemplateId: z.string().trim().optional().or(z.literal("")),
});

export type EmployeeInput = z.infer<typeof EmployeeInput>;

export const LeaveRequestInput = z.object({
  employeeId: z.string().min(1),
  leaveTypeName: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const ExpenseInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  category: z.enum(["travel", "meals", "equipment", "training", "medical", "other"]).default("other"),
  amount: z.number().min(0.01, "Amount must be positive"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
});

export const StaffRequestInput = z.object({
  category: z.enum(["general", "it", "hr", "facilities", "finance", "admin"]).default("general"),
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});
