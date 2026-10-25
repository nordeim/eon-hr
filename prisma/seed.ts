/* Eon HR — idempotent seed.
 *
 * Replicates the reference deployment's data for the demo account:
 * company "Demo" (retail, Singapore), the demo user with Annual 21/21 and
 * Sick 30/30 leave balances, and empty collections elsewhere. Natural-key
 * upserts keep it safe to re-run.
 *
 * Run: bun run db:seed  (after bun run db:push)
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function scryptHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const DEMO_EMAIL = "sepnetflix2023@outlook.com";
const DEMO_PASSWORD = "$Abcd1234";
const YEAR = new Date().getFullYear();

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "company" },
    update: {
      name: "Demo",
      industry: "retail",
      phone: "+65 87651230",
      email: DEMO_EMAIL,
      address: "Singapore, Singapore",
    },
    create: {
      id: "company",
      name: "Demo",
      industry: "retail",
      phone: "+65 87651230",
      email: DEMO_EMAIL,
      address: "Singapore, Singapore",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      passwordHash: scryptHash(DEMO_PASSWORD),
      name: "sepnetflix2023",
      role: "admin",
    },
  });

  const employee = await prisma.employee.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      employeeId: "EMP-0001",
      userId: user.id,
      firstName: "sepnetflix2023",
      lastName: "",
      email: DEMO_EMAIL,
      employmentStatus: "active",
      employmentType: "full_time",
      startDate: new Date("2024-01-15"),
    },
  });

  const annual = await prisma.leaveType.upsert({
    where: { name: "Annual Leave" },
    update: { quotaDays: 21, color: "#2563eb" },
    create: { name: "Annual Leave", quotaDays: 21, color: "#2563eb" },
  });
  const sick = await prisma.leaveType.upsert({
    where: { name: "Sick Leave" },
    update: { quotaDays: 30, color: "#10b981" },
    create: { name: "Sick Leave", quotaDays: 30, color: "#10b981" },
  });
  const unpaid = await prisma.leaveType.upsert({
    where: { name: "Unpaid Leave" },
    update: { quotaDays: 0, color: "#6b7280" },
    create: { name: "Unpaid Leave", quotaDays: 0, color: "#6b7280" },
  });
  const maternity = await prisma.leaveType.upsert({
    where: { name: "Maternity Leave" },
    update: { quotaDays: 70, color: "#8b5cf6" },
    create: { name: "Maternity Leave", quotaDays: 70, color: "#8b5cf6" },
  });
  // Session92 (R92-E): the REF's leave dialog offers SEVEN types — the three
  // below were missing from the seed. No balances (the REF's own zero-quota
  // state for non-core types).
  const personal = await prisma.leaveType.upsert({
    where: { name: "Personal Leave" },
    update: { quotaDays: 0, color: "#f59e0b" },
    create: { name: "Personal Leave", quotaDays: 0, color: "#f59e0b" },
  });
  const emergency = await prisma.leaveType.upsert({
    where: { name: "Emergency Leave" },
    update: { quotaDays: 0, color: "#ef4444" },
    create: { name: "Emergency Leave", quotaDays: 0, color: "#ef4444" },
  });
  const paternity = await prisma.leaveType.upsert({
    where: { name: "Paternity Leave" },
    update: { quotaDays: 3, color: "#06b6d4" },
    create: { name: "Paternity Leave", quotaDays: 3, color: "#06b6d4" },
  });
  void personal; void emergency; void paternity;

  // Leave balances for the demo employee — matches the dashboard cards.
  await prisma.leaveBalance.upsert({
    where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: annual.id, year: YEAR } },
    update: { entitled: 21, used: 0 },
    create: { employeeId: employee.id, leaveTypeId: annual.id, year: YEAR, entitled: 21, used: 0 },
  });
  await prisma.leaveBalance.upsert({
    where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: sick.id, year: YEAR } },
    update: { entitled: 30, used: 0 },
    create: { employeeId: employee.id, leaveTypeId: sick.id, year: YEAR, entitled: 30, used: 0 },
  });


  // Session93 (R93-H): the REF's three-job tenant (live-read 2026-10-25 — the
  // Job Postings tab's card order HR Manager -> HR Director -> System Admin rides
  // the API's postedAt DESC: System Admin oldest, HR Manager newest). The
  // descriptions are the REF's verbatim blobs (including its own copy-paste
  // artifacts — the HR Director's Jeddah/HR-Manager mentions). Idempotent
  // upserts: the update arm also carries postedAt (the convergence rule).
  await prisma.jobPosting.upsert({
    where: { id: "job-sysadmin" },
    update: { title: "System Admin", department: "IT", location: "Jeddah", type: "full_time", status: "active", company: "Company", salaryRange: "12000-15000", description: "We’re looking for a detail-oriented and tech-savvy HR Technology Specialist to support the implementation, management, and optimization of our AI-driven HR platform. You’ll work closely with HR, IT, and people leaders to ensure our systems run smoothly, securely, and effectively. Key Responsibilities Configure and maintain our HR management system (e.g., Aevi or similar AI-HR platform) Support employee onboarding, data management, and system troubleshooting Train HR team members and managers on platform features and best practices Monitor system performance and recommend improvements Ensure data privacy, compliance, and security standards are met Collaborate with vendors and internal teams on integrations and updates What We’re Looking For 2+ years of experience with HRIS, HR tech, or SaaS platforms Familiarity with AI-powered tools or data-driven HR practices (a plus) Strong problem-solving skills and attention to detail Excellent communication and training abilities Bachelor’s degree in HR, IT, Business, or a related field (or equivalent experience) Why Join Us? Be part of a team shaping the future of work Work with cutting-edge AI and HR technology Flexible work environment and growth opportunities Competitive compensation and benefits", postedAt: new Date("2026-01-05T09:00:00Z") },
    create: { id: "job-sysadmin", title: "System Admin", department: "IT", location: "Jeddah", type: "full_time", status: "active", company: "Company", salaryRange: "12000-15000", description: "We’re looking for a detail-oriented and tech-savvy HR Technology Specialist to support the implementation, management, and optimization of our AI-driven HR platform. You’ll work closely with HR, IT, and people leaders to ensure our systems run smoothly, securely, and effectively. Key Responsibilities Configure and maintain our HR management system (e.g., Aevi or similar AI-HR platform) Support employee onboarding, data management, and system troubleshooting Train HR team members and managers on platform features and best practices Monitor system performance and recommend improvements Ensure data privacy, compliance, and security standards are met Collaborate with vendors and internal teams on integrations and updates What We’re Looking For 2+ years of experience with HRIS, HR tech, or SaaS platforms Familiarity with AI-powered tools or data-driven HR practices (a plus) Strong problem-solving skills and attention to detail Excellent communication and training abilities Bachelor’s degree in HR, IT, Business, or a related field (or equivalent experience) Why Join Us? Be part of a team shaping the future of work Work with cutting-edge AI and HR technology Flexible work environment and growth opportunities Competitive compensation and benefits", postedAt: new Date("2026-01-05T09:00:00Z") },
  });
  await prisma.jobPosting.upsert({
    where: { id: "job-hrdirector" },
    update: { title: "HR Director", department: "HR", location: "Riyadh", type: "full_time", status: "draft", description: "Job Description We are seeking a dedicated and experienced Human Resources Manager to join our dynamic team in Jeddah, Saudi Arabia. The ideal candidate will play a critical role in shaping the company’s human resources strategy and ensuring that our workforce is engaged, motivated, and aligned with our business goals. This position requires a strategic thinker who can also manage day-to-day HR operations effectively. The HR Manager will be responsible for overseeing recruitment, employee relations, performance management, and compliance with labor laws. With a focus on fostering a positive workplace culture, you will implement HR initiatives that enhance employee satisfaction and retention. Responsibilities: Develop and implement HR strategies and initiatives aligned with the overall business strategy. Manage the recruitment and selection process, ensuring a smooth onboarding experience for new hires. Oversee employee performance management systems, providing guidance and support to managers in conducting performance evaluations. Address employee relations issues and provide conflict resolution, ensuring a harmonious workplace environment. Ensure compliance with labor laws and regulations, keeping up to date with changes in employment legislation. Implement and manage training and development programs to enhance employee skills and career progression. Conduct employee engagement surveys and analyze results to improve workplace culture and employee satisfaction. Maintain HR metrics and reporting to track the effectiveness of HR initiatives and make data-driven decisions. Collaborate with department heads to understand their HR needs and provide tailored support. Act as a point of contact for employees regarding HR policies, procedures, and benefits. Preferred Candidate: Proven experience as an HR Manager or similar role in a fast-paced environment. Strong understanding of HR practices, labor laws, and regulations in Saudi Arabia. Excellent interpersonal and communication skills, capable of building strong relationships with employees at all levels. Ability to think strategically and translate business objectives into HR initiatives. Demonstrated experience in conflict resolution and employee engagement strategies. Proficiency in using HR software and tools for data management and reporting. Strong analytical skills and attention to detail for effective decision-making. Ability to maintain confidentiality and handle sensitive information with discretion. Commitment to fostering a diverse and inclusive workplace. Relevant HR certifications (e.g., CIPD, SHRM) are a plus. Skills Recruitment and Selection: Proficiency in sourcing, screening, and selecting candidates that fit organizational culture and job requirements, ensuring a robust talent pipeline. Employee Relations: Strong skills in managing employee relations, resolving conflicts, and fostering a positive workplace environment through effective communication and mediation. Performance Management: Expertise in designing and implementing performance management systems that align employee goals with organizational objectives, enabling continuous feedback and development. Compliance Knowledge: In-depth knowledge of labor laws and regulations in Saudi Arabia, ensuring the organization adheres to legal standards and mitigates risks. Training and Development: Ability to identify training needs and develop programs that enhance employee skills, promoting career growth and organizational effectiveness.", postedAt: new Date("2026-02-10T09:00:00Z") },
    create: { id: "job-hrdirector", title: "HR Director", department: "HR", location: "Riyadh", type: "full_time", status: "draft", description: "Job Description We are seeking a dedicated and experienced Human Resources Manager to join our dynamic team in Jeddah, Saudi Arabia. The ideal candidate will play a critical role in shaping the company’s human resources strategy and ensuring that our workforce is engaged, motivated, and aligned with our business goals. This position requires a strategic thinker who can also manage day-to-day HR operations effectively. The HR Manager will be responsible for overseeing recruitment, employee relations, performance management, and compliance with labor laws. With a focus on fostering a positive workplace culture, you will implement HR initiatives that enhance employee satisfaction and retention. Responsibilities: Develop and implement HR strategies and initiatives aligned with the overall business strategy. Manage the recruitment and selection process, ensuring a smooth onboarding experience for new hires. Oversee employee performance management systems, providing guidance and support to managers in conducting performance evaluations. Address employee relations issues and provide conflict resolution, ensuring a harmonious workplace environment. Ensure compliance with labor laws and regulations, keeping up to date with changes in employment legislation. Implement and manage training and development programs to enhance employee skills and career progression. Conduct employee engagement surveys and analyze results to improve workplace culture and employee satisfaction. Maintain HR metrics and reporting to track the effectiveness of HR initiatives and make data-driven decisions. Collaborate with department heads to understand their HR needs and provide tailored support. Act as a point of contact for employees regarding HR policies, procedures, and benefits. Preferred Candidate: Proven experience as an HR Manager or similar role in a fast-paced environment. Strong understanding of HR practices, labor laws, and regulations in Saudi Arabia. Excellent interpersonal and communication skills, capable of building strong relationships with employees at all levels. Ability to think strategically and translate business objectives into HR initiatives. Demonstrated experience in conflict resolution and employee engagement strategies. Proficiency in using HR software and tools for data management and reporting. Strong analytical skills and attention to detail for effective decision-making. Ability to maintain confidentiality and handle sensitive information with discretion. Commitment to fostering a diverse and inclusive workplace. Relevant HR certifications (e.g., CIPD, SHRM) are a plus. Skills Recruitment and Selection: Proficiency in sourcing, screening, and selecting candidates that fit organizational culture and job requirements, ensuring a robust talent pipeline. Employee Relations: Strong skills in managing employee relations, resolving conflicts, and fostering a positive workplace environment through effective communication and mediation. Performance Management: Expertise in designing and implementing performance management systems that align employee goals with organizational objectives, enabling continuous feedback and development. Compliance Knowledge: In-depth knowledge of labor laws and regulations in Saudi Arabia, ensuring the organization adheres to legal standards and mitigates risks. Training and Development: Ability to identify training needs and develop programs that enhance employee skills, promoting career growth and organizational effectiveness.", postedAt: new Date("2026-02-10T09:00:00Z") },
  });
  await prisma.jobPosting.upsert({
    where: { id: "job-hrmanager" },
    update: { title: "HR Manager", department: "HR", location: "Jeddah", type: "full_time", status: "draft", description: "Role Overview The HR Manager at Rimac Logistics – Jeddah is responsible for leading and executing the full spectrum of Human Resources functions. This role ensures strict compliance with Saudi Labor Law, drives effective talent management, supports employee relations, and aligns HR strategies with business objectives. The position plays a critical role in supporting Saudization (Nitaqat) requirements and acting as a key liaison with government platforms and authorities. Key Responsibilities Compliance & HR Operations Ensure full compliance with Saudi Labor Law and Ministry of Human Resources regulations. Manage payroll, employee benefits, attendance, and end-of-service settlements. Maintain accurate employee records and HR documentation. Coordinate with government platforms such as GOSI, Qiwa, Muqeem, and Absher. Recruitment & Talent Management Develop and execute recruitment strategies aligned with business needs. Manage end-to-end recruitment processes, including sourcing, interviewing, hiring, and onboarding. Build and maintain a strong talent pipeline, with a focus on Saudi nationals. Performance Management & Development Implement and manage performance appraisal systems. Identify training needs and design development programs to enhance employee capabilities. Support succession planning and career development initiatives. Employee Relations Handle employee grievances, disciplinary actions, and conflict resolution. Promote a positive, inclusive, and compliant workplace culture. Serve as a trusted point of contact for employee HR-related inquiries. HR Strategy & Policy Develop, review, and update HR policies and procedures. Advise management on organizational structure, workforce planning, and HR best practices. Align HR initiatives with Rimac Logistics’ operational and strategic goals. Reporting & Analytics Track and analyze HR metrics such as headcount, turnover, Saudization ratios, and absenteeism. Prepare periodic HR reports and dashboards for senior management. Qualifications & Requirements Bachelor’s degree in Human Resources, Business Administration, or a related field. Minimum 5–10 years of progressive HR experience across multiple HR functions. Strong and up-to-date knowledge of Saudi Labor Law, MOHR regulations, and GOSI. Experience in logistics, manufacturing, or FMCG sectors is preferred. Fluency in Arabic and English (written and spoken). Saudi National preferred in line with Saudization (Nitaqat) requirements. Key Focus Areas (Jeddah) Saudization Compliance: Ensuring alignment with Nitaqat and localization targets. Cultural Fit: Supporting hiring and engagement practices suited to the local work environment. Government Liaison: Managing visas, work permits, contracts, and regulatory reporting efficiently.", postedAt: new Date("2026-03-15T09:00:00Z") },
    create: { id: "job-hrmanager", title: "HR Manager", department: "HR", location: "Jeddah", type: "full_time", status: "draft", description: "Role Overview The HR Manager at Rimac Logistics – Jeddah is responsible for leading and executing the full spectrum of Human Resources functions. This role ensures strict compliance with Saudi Labor Law, drives effective talent management, supports employee relations, and aligns HR strategies with business objectives. The position plays a critical role in supporting Saudization (Nitaqat) requirements and acting as a key liaison with government platforms and authorities. Key Responsibilities Compliance & HR Operations Ensure full compliance with Saudi Labor Law and Ministry of Human Resources regulations. Manage payroll, employee benefits, attendance, and end-of-service settlements. Maintain accurate employee records and HR documentation. Coordinate with government platforms such as GOSI, Qiwa, Muqeem, and Absher. Recruitment & Talent Management Develop and execute recruitment strategies aligned with business needs. Manage end-to-end recruitment processes, including sourcing, interviewing, hiring, and onboarding. Build and maintain a strong talent pipeline, with a focus on Saudi nationals. Performance Management & Development Implement and manage performance appraisal systems. Identify training needs and design development programs to enhance employee capabilities. Support succession planning and career development initiatives. Employee Relations Handle employee grievances, disciplinary actions, and conflict resolution. Promote a positive, inclusive, and compliant workplace culture. Serve as a trusted point of contact for employee HR-related inquiries. HR Strategy & Policy Develop, review, and update HR policies and procedures. Advise management on organizational structure, workforce planning, and HR best practices. Align HR initiatives with Rimac Logistics’ operational and strategic goals. Reporting & Analytics Track and analyze HR metrics such as headcount, turnover, Saudization ratios, and absenteeism. Prepare periodic HR reports and dashboards for senior management. Qualifications & Requirements Bachelor’s degree in Human Resources, Business Administration, or a related field. Minimum 5–10 years of progressive HR experience across multiple HR functions. Strong and up-to-date knowledge of Saudi Labor Law, MOHR regulations, and GOSI. Experience in logistics, manufacturing, or FMCG sectors is preferred. Fluency in Arabic and English (written and spoken). Saudi National preferred in line with Saudization (Nitaqat) requirements. Key Focus Areas (Jeddah) Saudization Compliance: Ensuring alignment with Nitaqat and localization targets. Cultural Fit: Supporting hiring and engagement practices suited to the local work environment. Government Liaison: Managing visas, work permits, contracts, and regulatory reporting efficiently.", postedAt: new Date("2026-03-15T09:00:00Z") },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.securitySettings.upsert({
    where: { id: "security" },
    update: { twoFactorAuth: false, auditLogging: true, dataEncryption: true, automatedBackups: true, gdprCompliance: true },
    create: { id: "security", twoFactorAuth: false, auditLogging: true, dataEncryption: true, automatedBackups: true, gdprCompliance: true },
  });

  console.log(`Seed complete for ${user.email} (company: ${company.name}).`);
  console.log(`Leave balances: Annual 21/21, Sick 30/30 (${YEAR}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
