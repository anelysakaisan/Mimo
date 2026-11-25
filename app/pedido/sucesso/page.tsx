import { confirmInfinitePayPayment } from "../../lib/infinitepay";

export const dynamic = "force-dynamic";
export default async function PaymentReturn({ searchParams }:{ searchParams:Promise<Record<string,string|undefined>> }) {
  const params = await searchParams; const orderId = params.order_nsu || ""; const transaction = params.transaction_nsu || ""; const slug = params.slug || "";
  const result = orderId && transaction && slug ? await confirmInfinitePayPayment(orderId, transaction, slug) : { paid:false };
  return <main className="payment-result"><div><span>{result.paid ? "✓" : "⌛"}</span><p className="eyebrow">MIMO CHERRY</p><h1>{result.paid ? "Pagamento confirmado!" : "Estamos confirmando seu pagamento"}</h1><p>{result.paid ? `Seu pedido ${orderId.slice(0,8)} foi recebido e será preparado com carinho.` : "Se o valor já foi pago, aguarde alguns instantes. A confirmação também acontece automaticamente."}</p><a className="primary" href="/">Voltar para a loja</a></div></main>;
}
