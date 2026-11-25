import { NextResponse } from "next/server";
import { confirmInfinitePayPayment } from "../../../lib/infinitepay";

export async function POST(request:Request) {
  const body = await request.json() as Record<string,unknown>; const orderId = String(body.order_nsu || ""); const transactionNsu = String(body.transaction_nsu || ""); const slug = String(body.invoice_slug || body.slug || "");
  if (!orderId || !transactionNsu || !slug) return NextResponse.json({ error:"Evento inválido" }, { status:400 });
  const confirmed = await confirmInfinitePayPayment(orderId, transactionNsu, slug); return NextResponse.json({ received:true, paid:confirmed.paid });
}
