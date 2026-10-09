import { ok, guard } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  return guard(async () => {
    await clearSessionCookie();
    return ok({ signedOut: true });
  });
}
