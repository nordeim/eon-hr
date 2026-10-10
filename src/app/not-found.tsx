import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Session 10 (R9-F): the reference renders unmatched routes as a centered
 * 72px/300 "404" + 24px/500 "Page Not Found" INSIDE the app shell (sidebar
 * present for authenticated sessions — measured on its /reviews and
 * /reviewcycles, which 404 there too). The clone previously served the
 * Next.js default small inline 404 with no shell.
 *
 * Unauthenticated visitors get the same centered block on the canvas
 * gradient (the reference's logged-out 404 is unmeasurable — its router
 * only ever renders the shell for signed-in sessions).
 */
export default async function NotFound() {
  const user = await getSessionUser();

  const block = (
    <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center px-4 pb-40 text-center">
      <h1 className="text-7xl font-light text-slate-900">404</h1>
      <h2 className="mt-8 text-2xl font-medium text-slate-900">Page Not Found</h2>
    </div>
  );

  if (user) {
    return (
      <AppShell user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>
        {block}
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4">
      {block}
    </div>
  );
}
