import { NextResponse } from "next/server";
import { listProducts } from "../../../db/products";
import { attachCheckout, createOrder, failOrder } from "../../../db/orders";
import { createInfinitePayLink } from "../../lib/infinitepay";

export async function POST(request:Request) {
  if (!process.env.INFINITEPAY_API_KEY || !process.env.INFINITEPAY_HANDLE || !process.env.MIMOCHERRY_FLAT_SHIPPING_CENTS) return NextResponse.json({ error:"O pagamento ainda está sendo configurado." }, { status:503 });
  const body = await request.json() as { items?:{ id:number; quantity:number; variant?:string; preference?:string }[] }; if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) return NextResponse.json({ error:"Sacola inválida" }, { status:400 });
  const products = await listProducts(true); const items = [];
  for (const requested of body.items) { const product = products.find((candidate) => candidate.id === Number(requested.id)); const quantity = Math.floor(Number(requested.quantity)); if (!product || !product.active || quantity < 1 || quantity > product.stock) return NextResponse.json({ error:"Um produto ficou indisponível. Atualize sua sacola." }, { status:409 }); const variant = requested.variant ? product.variants.find((candidate) => candidate.name === requested.variant) : product.variants[0]; if (product.variants.length && !variant) return NextResponse.json({ error:"Escolha novamente a modalidade do seu Scoop." }, { status:409 }); const preference = product.category === "Scoops" ? String(requested.preference || "").trim().slice(0,500) : ""; items.push({ productId:product.id, productName:variant ? `${product.name} — ${variant.name}` : product.name, unitPriceCents:Math.round((variant?.price ?? product.price)*100), quantity, preference }); }
  const subtotal = items.reduce((sum,item) => sum + item.unitPriceCents*item.quantity,0); const freeThreshold = Number(process.env.MIMOCHERRY_FREE_SHIPPING_CENTS || 19900); const shipping = subtotal >= freeThreshold ? 0 : Math.max(0, Number(process.env.MIMOCHERRY_FLAT_SHIPPING_CENTS));
  const order = await createOrder(items, shipping);
  try { const checkoutUrl = await createInfinitePayLink(order, items, new URL(request.url).origin); await attachCheckout(order.id, checkoutUrl); return NextResponse.json({ checkoutUrl }); }
  catch { await failOrder(order.id); return NextResponse.json({ error:"Não foi possível abrir o pagamento agora. Tente novamente." }, { status:502 }); }
}
