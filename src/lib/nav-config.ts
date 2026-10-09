import {
  LayoutDashboard,
  Users,
  DollarSign,
  UserPlus,
  GraduationCap,
  ShieldCheck,
  Target,
  Package,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Bot,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
  icon: LucideIcon;
}

// The sidebar tree — matches the reference app exactly (labels + routes).
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Employees",
    icon: Users,
    children: [
      { label: "All Employees", href: "/employees" },
      { label: "Tasks & Projects", href: "/taskmanager" },
      { label: "Leave Requests", href: "/allleaverequests" },
      { label: "Attendance", href: "/attendance" },
      { label: "Shift Calendar", href: "/shiftcalendar" },
      { label: "Document Tracker", href: "/documenttracker" },
    ],
  },
  {
    label: "Payroll",
    icon: DollarSign,
    children: [
      { label: "Payroll", href: "/payroll" },
      { label: "Payroll Module", href: "/payrollmodule" },
      { label: "Payroll Engine", href: "/payrollengine" },
      { label: "Loans", href: "/loans" },
      { label: "Expenses", href: "/expenses" },
    ],
  },
  {
    label: "Recruitment",
    icon: UserPlus,
    children: [
      { label: "Job Postings", href: "/recruitment" },
      { label: "Recruitment Kanban", href: "/recruitmentkanban" },
      { label: "Interview Assistant", href: "/interviewassistant" },
      { label: "Onboarding", href: "/templates" },
      { label: "Offboarding", href: "/offboarding" },
    ],
  },
  { label: "Training LMS", href: "/training", icon: GraduationCap },
  {
    label: "Compliance",
    icon: ShieldCheck,
    children: [
      { label: "AI Compliance Monitor", href: "/compliancedashboard" },
      { label: "HR Letters", href: "/hrletters" },
      { label: "Surveys", href: "/surveys" },
      { label: "Templates", href: "/templates" },
    ],
  },
  {
    label: "Performance",
    icon: Target,
    children: [
      { label: "Goals & Reviews", href: "/performancemanagement" },
      { label: "360° Evaluations", href: "/evaluations" },
      { label: "Workflow Automation", href: "/workflowautomation" },
    ],
  },
  { label: "Assets", href: "/assetmanagement", icon: Package },
  { label: "Staff Requests", href: "/staffrequests", icon: ClipboardList },
  {
    label: "Communications",
    icon: MessageSquare,
    children: [
      { label: "Company Wall", href: "/companywall" },
      { label: "Chat", href: "/chat" },
      { label: "Announcements", href: "/announcements" },
      { label: "Notifications", href: "/notificationpreferences" },
      { label: "Communications", href: "/communications" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { label: "Analytics", href: "/analytics" },
      { label: "Advanced Analytics", href: "/advancedanalytics" },
      { label: "Visual Dashboard", href: "/analyticsdashboard" },
      { label: "Survey Analytics", href: "/surveyanalytics" },
      { label: "Attendance Dashboard", href: "/attendancedashboard" },
      { label: "HR Reports", href: "/hrreports" },
      { label: "Reports", href: "/reports" },
      { label: "Organogram", href: "/organogram" },
    ],
  },
  { label: "AI HR Assistant", href: "/hrassistantchat", icon: Bot },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "System Settings", href: "/settings" },
      { label: "Security Settings", href: "/securitysettings" },
      { label: "Workflow Engine", href: "/workflowconfigpage" },
    ],
  },
];

export const BOTTOM_NAV: NavChild[] = [
  { label: "Home", href: "/dashboard" },
  { label: "Staff", href: "/employees" },
  { label: "Tasks", href: "/taskmanager" },
  { label: "Attendance", href: "/attendance" },
  { label: "Profile", href: "/profile" },
];
