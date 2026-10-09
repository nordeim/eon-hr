import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { getSessionUser, type SessionUser } from "./auth";

// ---------------------------------------------------------------------------
// ActionResult envelope (scandihaven PAD ADR-002, adapted for route handlers):
// every API response is { ok: true, data } | { ok: false, error: {code,
// message, fieldErrors?} }. Nothing throws across the boundary.
// ---------------------------------------------------------------------------

export type ApiErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  error: { code: ApiErrorCode; message: string; fieldErrors?: Record<string, string[]> };
}
export type ApiResult<T> = ApiOk<T> | ApiErr;

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export function ok<T>(data: T, init?: number): NextResponse<ApiOk<T>> {
  return NextResponse.json({ ok: true as const, data }, { status: init ?? 200 });
}

export function err(
  code: ApiErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>
): NextResponse<ApiErr> {
  return NextResponse.json(
    { ok: false as const, error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } },
    { status: STATUS[code] }
  );
}

export function zodErr(e: ZodError): NextResponse<ApiErr> {
  const flat = e.flatten();
  const fieldErrors: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat.fieldErrors)) {
    const messages = Array.isArray(v) ? v : v ? [String(v)] : [];
    if (messages.length) fieldErrors[k] = messages;
  }
  return err("VALIDATION", "Validation failed", fieldErrors);
}

/** Wrap a handler body: catches, logs once, returns INTERNAL. */
export async function guard<T>(fn: () => Promise<NextResponse<ApiResult<T>>>): Promise<NextResponse<ApiResult<T>>> {
  try {
    return await fn();
  } catch (e) {
    console.error("[api]", e);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
}

export async function requireUser(): Promise<
  { user: SessionUser; response: null } | { user: null; response: NextResponse<ApiErr> }
> {
  const user = await getSessionUser();
  if (!user) return { user: null, response: err("UNAUTHENTICATED", "Sign in required") };
  return { user, response: null };
}

export async function requireRole(
  roles: string[]
): Promise<{ user: SessionUser; response: null } | { user: null; response: NextResponse<ApiErr> }> {
  const r = await requireUser();
  if (!r.user) return r;
  if (!roles.includes(r.user.role)) {
    return { user: null, response: err("FORBIDDEN", "You do not have permission for this action") };
  }
  return r;
}

export async function parseBody<S extends ZodType>(
  req: Request,
  schema: S
): Promise<{ data: import("zod").output<S>; response: null } | { data: null; response: NextResponse<ApiErr> }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { data: null, response: err("VALIDATION", "Invalid JSON body") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { data: null, response: zodErr(parsed.error) };
  return { data: parsed.data, response: null };
}
