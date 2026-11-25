import { NextResponse } from "next/server";
import { ownerIdentity, verifyAccessCode } from "../../../admin/authorization";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const owner = await ownerIdentity(false);
  if (!owner.ok) return NextResponse.json({ error: "Acesso negado" }, { status: owner.status });
  const body = await request.json() as { code?: string };
  if (!await verifyAccessCode(String(body.code ?? ""), owner.user.userId)) return NextResponse.json({ error: "Código incorreto" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
