import { getOrder, markPaid } from "../../db/orders";

const API = "https://api.checkout.infinitepay.io";
function credentials() { const apiKey = process.env.INFINITEPAY_API_KEY; const handle = process.env.INFINITEPAY_HANDLE; if (!apiKey || !handle) throw new Error("InfinitePay ainda não configurada"); return { apiKey, handle }; }

export async function createInfinitePayLink(order:{ id:string; totalCents:number }, items:{ productName:string; unitPriceCents:number; quantity:number }[], origin:string) {
  const { apiKey } = credentials(); const checkoutItems = items.map((item) => ({ description:item.productName, price:item.unitPriceCents, quantity:item.quantity }));
  const productsTotal = checkoutItems.reduce((sum,item) => sum + item.price * item.quantity, 0); const shipping = order.totalCents - productsTotal;
  if (shipping > 0) checkoutItems.push({ description:"Frete", price:shipping, quantity:1 });
  const response = await fetch(`${API}/links`, { method:"POST", headers:{ "Content-Type":"application/json", "X-Api-Key":apiKey }, body:JSON.stringify({ order_nsu:order.id, redirect_url:`${origin}/pedido/sucesso`, webhook_url:`${origin}/api/webhooks/infinitepay`, items:checkoutItems, options:{ require_delivery_address:true, single_payment:true, valid_until:new Date(Date.now()+30*60*1000).toISOString(), payment_methods_enabled:["credit_card","pix"] } }) });
  if (!response.ok) throw new Error(`InfinitePay recusou a criação do checkout (${response.status})`);
  const result = await response.json() as { url?:string }; if (!result.url || !result.url.startsWith("https://")) throw new Error("Resposta inválida da InfinitePay"); return result.url;
}

export async function confirmInfinitePayPayment(orderId:string, transactionNsu:string, slug:string) {
  const order = await getOrder(orderId); if (!order) return { paid:false, reason:"not-found" };
  if (order.status === "paid") return { paid:true, order };
  const { apiKey, handle } = credentials();
  const response = await fetch(`${API}/payment_check`, { method:"POST", headers:{ "Content-Type":"application/json", "X-Api-Key":apiKey }, body:JSON.stringify({ handle, order_nsu:orderId, transaction_nsu:transactionNsu, slug }) });
  if (!response.ok) return { paid:false, reason:"provider-error" };
  const result = await response.json() as { success?:boolean; paid?:boolean; amount?:number };
  if (!result.success || !result.paid || result.amount !== order.totalCents) return { paid:false, reason:"not-confirmed" };
  const recorded=await markPaid(orderId, transactionNsu, slug); if (!recorded) return { paid:false, reason:"not-pending" }; return { paid:true, order:{ ...order, status:"paid" } };
}
