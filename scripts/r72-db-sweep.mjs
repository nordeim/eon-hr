// r72-db-sweep.mjs — the r61-protocol pristine sweep: remove the known
// loading-probe@example.com test user (re-fired by the ladder's
// loading-state reads) so the seeded DB returns to users =
// [sepnetflix2023@outlook.com] only.
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const probe = await p.user.findUnique({ where: { email: "loading-probe@example.com" } });
if (probe) {
  // The probe user has no related rows (the loading-state tests create it
  // bare via the ensure-user seam); delete cascades any stragglers.
  await p.user.delete({ where: { id: probe.id } }).catch(async (e) => {
    // If FKs block the bare delete, clear dependent rows first. The r80
    // lesson: the verify-r45 signup flow now seeds a notificationPref row
    // for the probe user (an FK the original fallback missed — P2003 on
    // the bare re-delete); clear every known dependent before retrying.
    await p.employee.deleteMany({ where: { userId: probe.id } }).catch(() => {});
    await p.notificationPreference.deleteMany({ where: { userId: probe.id } }).catch(() => {});
    await p.notification.deleteMany({ where: { userId: probe.id } }).catch(() => {});
    await p.auditLog.deleteMany({ where: { userId: probe.id } }).catch(() => {});
    await p.user.delete({ where: { id: probe.id } });
  });
  console.log("swept loading-probe user:", probe.id);
} else {
  console.log("no probe user present");
}
const users = await p.user.findMany({ select: { email: true } });
console.log("users now:", JSON.stringify(users));
await p.$disconnect();
