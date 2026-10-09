import { ok, guard } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  return guard(async () => {
    const user = await getSessionUser();
    return ok({ user });
  });
}
