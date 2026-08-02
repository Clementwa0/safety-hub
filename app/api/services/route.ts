import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "Auth endpoint ready" });
}

export async function POST() {
  return NextResponse.json({ ok: true, message: "Auth endpoint ready" });
}
