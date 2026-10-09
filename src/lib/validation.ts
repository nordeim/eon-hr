import { z } from "zod";

// Employee create/update payload — shared by POST and PATCH.
export const EmployeeInput = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().max(60).default(""),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
  department: z.string().trim().max(60).optional().or(z.literal("")),
  managerName: z.string().trim().max(120).optional().or(z.literal("")),
  employmentStatus: z.enum(["active", "on_leave", "suspended", "terminated"]).default("active"),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).default("full_time"),
  startDate: z.string().trim().optional().or(z.literal("")),
  baseSalary: z.number().int().min(0).max(1_000_000_000).default(0),
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
