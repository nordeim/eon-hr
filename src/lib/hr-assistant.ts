// Rule-based HR assistant — keyword matching over the user's question with
// canned, genuinely helpful answers. No external LLM required; this keeps the
// assistant fully local, fast and deterministic.

export function generateHrReply(question: string): string {
  const q = question.toLowerCase().trim();

  // greetings
  if (/^(hi|hello|hey|yo|salam|good\s(morning|afternoon|evening))\b/.test(q) && q.length < 40) {
    return "Hello! I'm your HR assistant. I can answer questions about leave balances, payroll periods, HR letters and company policy. What would you like to know?";
  }

  // leave / time off
  if (/(leave|vacation|holiday|time off|absence|annual|sick day|balance)/.test(q)) {
    return "Your leave balances live on My Portal under Leave Balances. The standard plan includes 21 days of Annual Leave and 30 days of Sick Leave per calendar year, and used days are deducted automatically once a request is approved. To request time off, open Leave Management, pick your start and end dates, add a reason and submit — your manager approves it from the Leave Requests page.";
  }

  // payroll / salary
  if (/(payroll|salary|payslip|pay slip|paycheck|pay check|payday|pay day|pay period|deduction|overtime|allowance|bonus)/.test(q)) {
    return "Payroll runs monthly — the current processing period is shown on the Payroll page (for example 2026-10 for October 2026). Every run calculates basic salary, allowances, bonus and deductions for each employee; late-arrival and absence deductions plus overtime are computed automatically from attendance records. Payslips appear under the Payroll Module once a run is approved, and records move to Paid after payment is released.";
  }

  // HR letters
  if (/(letter|certificate|noc|bank|employment proof|salary proof|experience letter|attestation)/.test(q)) {
    return "Official HR letters — employment verification, salary certificates, bank letters, NOCs and experience certificates — can be requested from the HR Letters page. Choose the letter type you need and submit the request; HR reviews it and issues the document, and you'll receive a notification as soon as it's ready to download.";
  }

  // company policy
  if (/(policy|policies|handbook|regulation|rule|working hours|work hours|remote|wfh|dress code|probation|notice period)/.test(q)) {
    return "Company policy in brief: standard full-time hours are 09:00–17:00, tracked through daily attendance clock-ins. Leave must be requested in advance via Leave Management, and expenses are submitted through the Expense Claims page with receipts attached. New hires serve a probation period defined in their contract. For the complete handbook, code of conduct and expense guidelines, ask HR to share the latest company handbook document.";
  }

  // fallback
  return "I can help with leave balances, payroll periods, HR letters and company policy. Try asking about those.";
}
