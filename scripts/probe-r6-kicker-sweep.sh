#!/usr/bin/env bash
# probe-r6-kicker-sweep.sh — classify every reference route's mobile header pattern.
# Usage: bash scripts/probe-r6-kicker-sweep.sh <base-url> [route ...]
# Output per route: kicker(y,title) | visible-h1(size,y) | headerMode
BASE="$1"; shift
ROUTES="$*"
[ -z "$ROUTES" ] && ROUTES="dashboard employees payroll payrollmodule payrollengine taskmanager leavemanagement allleaverequests profile securitysettings settings training communications expenses hrassistantchat interviewassistant recruitment recruitmentkanban documenttracker attendance attendancedashboard evaluations hrletters compliancedashboard organogram surveys surveyanalytics shiftcalendar performancemanagement workflowautomation workflowconfigpage staffrequests assetmanagement hrreports notificationpreferences announcements analytics analyticsdashboard advancedanalytics reports chat companywall templates loans offboarding employeeselfservice"

for r in $ROUTES; do
  agent-browser open "$BASE/$r" >/dev/null 2>&1
  sleep 4
  echo -n "/$r :: "
  agent-browser eval '(() => {
    const main = document.querySelector("main");
    if (!main) return "NO-MAIN";
    // sticky z-20 kicker with h1 (the reference mobile page-kicker)
    const ks = [...main.querySelectorAll(".sticky")].filter(
      (e) => getComputedStyle(e).zIndex === "20" && e.querySelector("h1") && e.getBoundingClientRect().height > 0
    );
    const k = ks[0];
    // a hidden md:flex/md:block header wrapper containing an h1
    const dh = [...main.querySelectorAll("div")].find(
      (d) =>
        /hidden md:(flex|block)/.test(d.className.toString()) &&
        d.querySelector("h1") &&
        !d.className.includes("sticky")
    );
    // the largest VISIBLE h1 below the top bar (page title at mobile)
    const h1 = [...main.querySelectorAll("h1")].filter((h) => h.offsetParent !== null && h.getBoundingClientRect().y > 80).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    const h1r = h1 ? h1.getBoundingClientRect() : null;
    const kicker = k
      ? { title: k.querySelector("h1").textContent.slice(0, 24), y: Math.round(k.getBoundingClientRect().y) }
      : null;
    return JSON.stringify({
      kicker,
      deskHdrHidden: dh ? dh.querySelector("h1").textContent.slice(0, 24) : null,
      visH1: h1 ? { t: h1.textContent.slice(0, 24), fs: getComputedStyle(h1).fontSize, y: Math.round(h1r.y) } : null,
    });
  })()' 2>&1 | tail -1
done
