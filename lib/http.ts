import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function badRequest(message: string, init?: ResponseInit) {
  return NextResponse.json({ ok: false, error: { message } }, { status: 400, ...init });
}

export function unauthorized(message = "Unauthorized", init?: ResponseInit) {
  return NextResponse.json({ ok: false, error: { message } }, { status: 401, ...init });
}

export function notFound(message = "Not found", init?: ResponseInit) {
  return NextResponse.json({ ok: false, error: { message } }, { status: 404, ...init });
}
