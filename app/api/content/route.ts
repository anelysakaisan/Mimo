import { NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "../../../db/content";
import { ownerIdentity } from "../../admin/authorization";

export async function GET() { return NextResponse.json(await getSiteContent()); }

export async function PATCH(request: Request) {
  const owner = await ownerIdentity();
  if (!owner.ok) return NextResponse.json({ error: "Acesso negado" }, { status: owner.status });
  const body = await request.json() as { key?: string; desktop?: string; mobile?: string };
  const key = String(body.key ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 50);
  if (!key) return NextResponse.json({ error: "Campo inválido" }, { status: 400 });
  await updateSiteContent(key, String(body.desktop ?? "").trim().slice(0, 500), String(body.mobile ?? "").trim().slice(0, 300));
  return NextResponse.json({ ok: true });
}
