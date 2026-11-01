#import "@preview/modern-cv:0.6.0": *

#show: resume.with(
  author: (
    firstname: "Jane",
    lastname: "Doe",
    positions: ("HR Director",),
    address: "San Francisco, CA",
    email: "john.smith@example.com",
    phone: "+1 (555) 010-9911",
  ),
  date: datetime(year: 2026, month: 10, day: 31).display("[month repr:long] [day], [year]"),
  show-footer: false,
)


= Profile

Strategic people operations leader with fifteen years of progressive experience across talent acquisition, compensation design and organizational development. Led a team of nine HR business partners through two acquisitions with payroll and GOSI compliance ownership.

= Experience

#resume-entry(
  title: "HR Director",
  location: "TechCorp",
  date: "Mar 2021 - Present",
  description: [
    Led a team of nine HR business partners through two acquisitions. Redesigned the compensation framework for 400 employees with onboarding compliance training.
  ],
)

#resume-entry(
  title: "HR Business Partner",
  location: "InnovateLLC",
  date: "Jun 2018 - Feb 2021",
  description: [
    Owned the performance review cycle and the onboarding program for 200 new hires.
  ],
)

= Skills

#resume-skill-item("HR Expertise", ("Employee Relations", "Compensation Design", "Talent Acquisition", "HRIS", "Workday", "SAP SuccessFactors", "payroll administration"))

= Certifications

#resume-certification("SHRM-SCP", "2020")
#resume-certification("PHR", "2017")

= Education

#resume-entry(
  title: "B.A. Psychology",
  location: "University of California, Berkeley",
  date: "2010 - 2014",
  description: [],
)
