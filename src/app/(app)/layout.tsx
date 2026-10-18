import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  /* Session 55 (R55-C): the PATH-CARRYING guard for logged-out visitors
     lives in the edge proxy (src/proxy.ts — App Router layouts receive
     no pathname, so this guard could never carry the requested URL).
     This full HMAC + DB verification stays as the defense-in-depth for
     present-but-INVALID cookies (the proxy only checks presence); its
     hardcoded from_url=/dashboard is the sensible recovery target for
     that edge case — the deep-link round-trip is the proxy's job. */
  if (!user) redirect("/login?from_url=" + encodeURIComponent("/dashboard"));

  return (
    <AppShell user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>
      {children}
    </AppShell>
  );
}
