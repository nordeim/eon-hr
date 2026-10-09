import { expect, test } from "@playwright/test";

// Desktop navigation: the sidebar renders the full reference tree and every
// route is reachable.
test.describe("sidebar navigation", () => {
  test("renders all 14 top-level menu items", async ({ page }) => {
    await page.goto("/dashboard");
    for (const item of [
      "Dashboard",
      "Employees",
      "Payroll",
      "Recruitment",
      "Training LMS",
      "Compliance",
      "Performance",
      "Assets",
      "Staff Requests",
      "Communications",
      "Analytics",
      "AI HR Assistant",
      "Settings",
    ]) {
      await expect(page.locator("nav").getByText(item, { exact: true })).toBeVisible();
    }
  });

  test("collapsible sections expand and their links navigate", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Employees", exact: true }).click();
    await expect(page.getByRole("link", { name: "All Employees" })).toBeVisible();
    await page.getByRole("link", { name: "Leave Requests" }).click();
    await expect(page).toHaveURL(/\/allleaverequests/);
    await expect(page.getByRole("heading", { name: "Leave Requests", exact: true })).toBeVisible();
  });

  test("the active route is highlighted in the sidebar", async ({ page }) => {
    await page.goto("/employees");
    const active = page.locator("aside nav a[aria-current='page']");
    await expect(active).toHaveAttribute("href", "/employees");
  });

  test("user menu opens with My Profile and Logout", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /sepnetflix2023/ }).click();
    await expect(page.getByRole("menuitem", { name: "My Profile" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Logout" })).toBeVisible();
  });

  test("logout clears the session and returns to the login page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /sepnetflix2023/ }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?from_url=/);
  });
});

// Every module route must render (200 + heading + no error boundary).
const ROUTES: [string, string][] = [
  ["/dashboard", "Welcome back"],
  ["/employees", "Employees"],
  ["/taskmanager", "Tasks & Projects"],
  ["/allleaverequests", "Leave Requests"],
  ["/attendance", "Staff Attendance"],
  ["/shiftcalendar", "Shift Calendar"],
  ["/documenttracker", "Document Tracker"],
  ["/payroll", "Payroll"],
  ["/payrollmodule", "Payroll Module"],
  ["/payrollengine", "Payroll Calculator"],
  ["/loans", "Employee Loans"],
  ["/expenses", "Expense Claims"],
  ["/recruitment", "Recruitment"],
  ["/recruitmentkanban", "Recruitment Pipeline"],
  ["/interviewassistant", "Interview Assistant"],
  ["/templates", "Onboarding Templates"],
  ["/offboarding", "Offboarding Journey"],
  ["/training", "Training Center"],
  ["/compliancedashboard", "Compliance Dashboard"],
  ["/hrletters", "HR Letters"],
  ["/surveys", "Surveys"],
  ["/performancemanagement", "Goals & Reviews"],
  ["/evaluations", "360° Evaluations & Appraisals"],
  ["/workflowautomation", "Automated Workflows"],
  ["/assetmanagement", "Asset Management"],
  ["/staffrequests", "Staff Requests"],
  ["/companywall", "Company Updates"],
  ["/chat", "Messages"],
  ["/announcements", "Company Announcements"],
  ["/notificationpreferences", "Notification Settings"],
  ["/communications", "Communications"],
  ["/analytics", "Analytics Dashboard"],
  ["/advancedanalytics", "Analytics & Insights"],
  ["/analyticsdashboard", "Analytics Dashboard"],
  ["/surveyanalytics", "Survey Analytics"],
  ["/attendancedashboard", "Attendance Dashboard"],
  ["/hrreports", "HR Reports & Analytics"],
  ["/reports", "Reports"],
  ["/organogram", "Organogram"],
  ["/hrassistantchat", "HR Assistant"],
  ["/settings", "Settings"],
  ["/securitysettings", "Security Settings"],
  ["/workflowconfigpage", "Approval Workflow Engine"],
  ["/employeeselfservice", "My Portal"],
  ["/profile", "Profile Settings"],
  ["/leavemanagement", "Leave Management"],
];

test.describe("all module routes render", () => {
  for (const [route, heading] of ROUTES) {
    test(`/${route.replace(/^\//, "")} renders`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), `HTTP status for ${route}`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(heading);
    });
  }
});
