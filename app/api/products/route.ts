import { NextResponse } from "next/server";
import { listProducts, updateProduct, type Product } from "../../../db/products";
import { ownerIdentity } from "../../admin/authorization";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wantsAdmin = url.searchParams.get("admin") === "1";
  if (wantsAdmin) {
    const owner = await ownerIdentity();
    if (!owner.ok) return NextResponse.json({ error: "Acesso negado" }, { status: owner.status });
  }
  return NextResponse.json(await listProducts(wantsAdmin));
}

export async function PATCH(request: Request) {
  const owner = await ownerIdentity();
  if (!owner.ok) return NextResponse.json({ error: "Acesso negado" }, { status: owner.status });
  const body = await request.json() as Partial<Product>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1 || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Produto inválido" }, { status: 400 });
  }
  const product = {
    name: body.name.trim().slice(0, 80), category: String(body.category ?? "Kits").trim().slice(0, 30),
    description: String(body.description ?? "").trim().slice(0, 180),
    price: Math.max(0, Number(body.price) || 0), stock: Math.max(0, Math.floor(Number(body.stock) || 0)),
    color: ["pink", "green", "blue"].includes(String(body.color)) ? String(body.color) : "pink",
    icon: String(body.icon ?? "🍒").slice(0, 8), active: Boolean(body.active),
    sortOrder: Math.max(0, Math.floor(Number(body.sortOrder) || 0)),
    slug: String(body.slug ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 100),
    compareAtPrice: body.compareAtPrice == null || body.compareAtPrice === 0 ? null : Math.max(0, Number(body.compareAtPrice) || 0),
    details: String(body.details ?? "").trim().slice(0, 2000), itemCount: String(body.itemCount ?? "").trim().slice(0, 60),
    experienceOptions: String(body.experienceOptions ?? "").trim().slice(0, 300),
    variants: Array.isArray(body.variants) ? body.variants.slice(0, 20).map((variant) => ({
      name:String(variant?.name || "").trim().slice(0, 60), price:Math.max(0, Number(variant?.price) || 0),
      compareAtPrice:variant?.compareAtPrice == null || Number(variant.compareAtPrice) === 0 ? null : Math.max(0, Number(variant.compareAtPrice) || 0),
      description:String(variant?.description || "").trim().slice(0, 240),
    })).filter((variant) => variant.name) : [],
    images: Array.isArray(body.images) ? body.images.slice(0, 8).map((url) => String(url).trim().slice(0, 1000)).filter((url) => /^https:\/\//i.test(url)) : [],
    videoUrl: /^https:\/\//i.test(String(body.videoUrl || "").trim()) ? String(body.videoUrl).trim().slice(0, 1000) : "",
  };
  await updateProduct(id, product);
  return NextResponse.json({ ok: true });
}
