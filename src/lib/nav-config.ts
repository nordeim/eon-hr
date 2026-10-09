import {
  LayoutDashboard,
  Users,
  DollarSign,
  UserPlus,
  Video,
  ShieldCheck,
  Target,
  Laptop,
  FileText,
  MessageCircle,
  BarChart3,
  Settings as SettingsIcon,
  // sub-item icons (measured from the reference sidebar)
  SquareCheckBig,
  Plane,
  Calendar,
  Calculator,
  Receipt,
  CircleCheckBig,
  Sparkles,
  ClipboardCheck,
  House,
  Briefcase,
  Bell,
  TrendingUp,
  MessageSquare,
  CircleUser,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
  icon: LucideIcon;
}

// The sidebar tree — matches the reference app exactly (labels, routes and
// icons; sub-item icons re-measured in the session-2 parity audit).
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Employees",
    icon: Users,
    children: [
      { label: "All Employees", href: "/employees", icon: Users },
      { label: "Tasks & Projects", href: "/taskmanager", icon: SquareCheckBig },
      { label: "Leave Requests", href: "/allleaverequests", icon: Plane },
      { label: "Attendance", href: "/attendance", icon: Calendar },
      { label: "Shift Calendar", href: "/shiftcalendar", icon: Calendar },
      { label: "Document Tracker", href: "/documenttracker", icon: FileText },
    ],
  },
  {
    label: "Payroll",
    icon: DollarSign,
    children: [
      { label: "Payroll", href: "/payroll", icon: DollarSign },
      { label: "Payroll Module", href: "/payrollmodule", icon: DollarSign },
      { label: "Payroll Engine", href: "/payrollengine", icon: Calculator },
      { label: "Loans", href: "/loans", icon: DollarSign },
      { label: "Expenses", href: "/expenses", icon: Receipt },
    ],
  },
  {
    label: "Recruitment",
    icon: UserPlus,
    children: [
      { label: "Job Postings", href: "/recruitment", icon: UserPlus },
      { label: "Recruitment Kanban", href: "/recruitmentkanban", icon: CircleCheckBig },
      { label: "Interview Assistant", href: "/interviewassistant", icon: Sparkles },
      { label: "Onboarding", href: "/templates", icon: CircleCheckBig },
      { label: "Offboarding", href: "/offboarding", icon: CircleCheckBig },
    ],
  },
  { label: "Training LMS", href: "/training", icon: Video },
  {
    label: "Compliance",
    icon: ShieldCheck,
    children: [
      { label: "AI Compliance Monitor", href: "/compliancedashboard", icon: ShieldCheck },
      { label: "HR Letters", href: "/hrletters", icon: FileText },
      { label: "Surveys", href: "/surveys", icon: MessageSquare },
      { label: "Templates", href: "/templates", icon: FileText },
    ],
  },
  {
    label: "Performance",
    icon: Target,
    children: [
      { label: "Goals & Reviews", href: "/performancemanagement", icon: Target },
      { label: "360° Evaluations", href: "/evaluations", icon: ClipboardCheck },
      { label: "Workflow Automation", href: "/workflowautomation", icon: Sparkles },
    ],
  },
  { label: "Assets", href: "/assetmanagement", icon: Laptop },
  { label: "Staff Requests", href: "/staffrequests", icon: FileText },
  {
    label: "Communications",
    icon: MessageCircle,
    children: [
      { label: "Company Wall", href: "/companywall", icon: House },
      { label: "Chat", href: "/chat", icon: MessageCircle },
      { label: "Announcements", href: "/announcements", icon: Briefcase },
      { label: "Notifications", href: "/notificationpreferences", icon: Bell },
      { label: "Communications", href: "/communications", icon: MessageCircle },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Advanced Analytics", href: "/advancedanalytics", icon: TrendingUp },
      { label: "Visual Dashboard", href: "/analyticsdashboard", icon: TrendingUp },
      { label: "Survey Analytics", href: "/surveyanalytics", icon: MessageSquare },
      { label: "Attendance Dashboard", href: "/attendancedashboard", icon: CircleCheckBig },
      { label: "HR Reports", href: "/hrreports", icon: BarChart3 },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Organogram", href: "/organogram", icon: Users },
    ],
  },
  { label: "AI HR Assistant", href: "/hrassistantchat", icon: Target },
  {
    label: "Settings",
    icon: SettingsIcon,
    children: [
      { label: "System Settings", href: "/settings", icon: SettingsIcon },
      { label: "Security Settings", href: "/securitysettings", icon: ShieldCheck },
      { label: "Workflow Engine", href: "/workflowconfigpage", icon: SettingsIcon },
    ],
  },
];

export const BOTTOM_NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Staff", href: "/employees", icon: Users },
  { label: "Tasks", href: "/taskmanager", icon: SquareCheckBig },
  { label: "Attendance", href: "/attendance", icon: Calendar },
  { label: "Profile", href: "/profile", icon: CircleUser },
];
