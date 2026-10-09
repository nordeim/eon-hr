import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/login", url.origin), { status: 303 });
  await clearSessionCookie();
  return res;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/login", url.origin), { status: 303 });
  await clearSessionCookie();
  return res;
}
