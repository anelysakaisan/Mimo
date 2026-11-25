import { env } from "cloudflare:workers";

export type CheckoutItem = { productId:number; productName:string; unitPriceCents:number; quantity:number; preference:string };
export type StoredOrder = { id:string; status:string; subtotalCents:number; shippingCents:number; totalCents:number; checkoutUrl:string|null; transactionNsu:string|null; invoiceSlug:string|null; trackingCode:string; trackingUrl:string; notes:string; createdAt:string; items?:StoredOrderItem[] };
export type StoredOrderItem={productId:number;productName:string;unitPriceCents:number;quantity:number;preference:string};

function database() { if (!env.DB) throw new Error("Banco de dados indisponível"); return env.DB; }

export async function ensureOrders() {
  const db = database();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'pending', subtotal_cents INTEGER NOT NULL, shipping_cents INTEGER NOT NULL, total_cents INTEGER NOT NULL, checkout_url TEXT, transaction_nsu TEXT, invoice_slug TEXT, tracking_code TEXT NOT NULL DEFAULT '', tracking_url TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', stock_deducted INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL, product_id INTEGER NOT NULL, product_name TEXT NOT NULL, unit_price_cents INTEGER NOT NULL, quantity INTEGER NOT NULL, preference TEXT NOT NULL DEFAULT '')`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)"),
  ]);
  const columns = await db.prepare("PRAGMA table_info(order_items)").all<{name:string}>();
  if (!columns.results.some((column) => column.name === "preference")) await db.prepare("ALTER TABLE order_items ADD COLUMN preference TEXT NOT NULL DEFAULT ''").run();
  const orderColumns=await db.prepare("PRAGMA table_info(orders)").all<{name:string}>();
  for(const [name,sql] of [["tracking_code","ALTER TABLE orders ADD COLUMN tracking_code TEXT NOT NULL DEFAULT ''"],["tracking_url","ALTER TABLE orders ADD COLUMN tracking_url TEXT NOT NULL DEFAULT ''"],["notes","ALTER TABLE orders ADD COLUMN notes TEXT NOT NULL DEFAULT ''"],["stock_deducted","ALTER TABLE orders ADD COLUMN stock_deducted INTEGER NOT NULL DEFAULT 0"]] as const)if(!orderColumns.results.some(c=>c.name===name))await db.prepare(sql).run();
}

export async function createOrder(items:CheckoutItem[], shippingCents:number) {
  await ensureOrders(); const db = database(); const id = crypto.randomUUID(); const now = new Date().toISOString();
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0); const totalCents = subtotalCents + shippingCents;
  await db.batch([
    db.prepare("INSERT INTO orders (id, status, subtotal_cents, shipping_cents, total_cents, created_at, updated_at) VALUES (?, 'pending', ?, ?, ?, ?, ?)").bind(id, subtotalCents, shippingCents, totalCents, now, now),
    ...items.map((item) => db.prepare("INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity, preference) VALUES (?, ?, ?, ?, ?, ?)").bind(id, item.productId, item.productName, item.unitPriceCents, item.quantity, item.preference)),
  ]);
  return { id, subtotalCents, shippingCents, totalCents };
}

export async function attachCheckout(id:string, checkoutUrl:string) { await database().prepare("UPDATE orders SET checkout_url = ?, updated_at = ? WHERE id = ? AND status = 'pending'").bind(checkoutUrl, new Date().toISOString(), id).run(); }
export async function failOrder(id:string) { await database().prepare("UPDATE orders SET status = 'checkout_failed', updated_at = ? WHERE id = ? AND status = 'pending'").bind(new Date().toISOString(), id).run(); }
const mapOrder=(row:Record<string,unknown>):StoredOrder=>({id:String(row.id),status:String(row.status),subtotalCents:Number(row.subtotal_cents),shippingCents:Number(row.shipping_cents),totalCents:Number(row.total_cents),checkoutUrl:row.checkout_url?String(row.checkout_url):null,transactionNsu:row.transaction_nsu?String(row.transaction_nsu):null,invoiceSlug:row.invoice_slug?String(row.invoice_slug):null,trackingCode:String(row.tracking_code||""),trackingUrl:String(row.tracking_url||""),notes:String(row.notes||""),createdAt:String(row.created_at||"")});
export async function getOrder(id:string):Promise<StoredOrder|null> { await ensureOrders(); const row = await database().prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<Record<string,unknown>>(); if (!row) return null; return mapOrder(row); }
export async function listOrders():Promise<StoredOrder[]>{await ensureOrders();const db=database();const rows=await db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 500").all<Record<string,unknown>>();const orders=rows.results.map(mapOrder);for(const order of orders){const items=await db.prepare("SELECT product_id,product_name,unit_price_cents,quantity,preference FROM order_items WHERE order_id=?").bind(order.id).all<Record<string,unknown>>();order.items=items.results.map(r=>({productId:Number(r.product_id),productName:String(r.product_name),unitPriceCents:Number(r.unit_price_cents),quantity:Number(r.quantity),preference:String(r.preference||"")}))}return orders}
export async function markPaid(id:string, transactionNsu:string, slug:string) {
  await ensureOrders(); const db=database();
  const order=await db.prepare("SELECT status, notes FROM orders WHERE id = ?").bind(id).first<{status:string;notes:string|null}>();
  if (!order || order.status !== "pending") return order?.status === "paid";
  const items=await db.prepare(`SELECT oi.product_id AS productId, oi.product_name AS productName, oi.quantity, p.category
    FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`).bind(id).all<{productId:number;productName:string;quantity:number;category:string}>();
  const individualItems=items.results.filter((item) => item.category !== "Scoops");
  const missing:string[]=[];
  for (const item of individualItems) {
    const product=await db.prepare("SELECT stock FROM products WHERE id = ?").bind(item.productId).first<{stock:number}>();
    if (!product || product.stock < item.quantity) missing.push(`${item.productName} (pedido ${item.quantity}, em estoque ${product?.stock ?? 0})`);
  }
  const now=new Date().toISOString();
  // O pagamento já foi confirmado pela InfinitePay: o pedido sempre passa a "pago".
  // Se faltar estoque, nada é baixado e fica um aviso nas observações para a proprietária decidir.
  if (missing.length) {
    const warning=`ATENÇÃO: pagamento confirmado, mas faltou estoque para: ${missing.join("; ")}. O estoque não foi baixado.`;
    const notes=[warning, order.notes || ""].filter(Boolean).join("\n").slice(0,1000);
    await db.prepare("UPDATE orders SET status = 'paid', stock_deducted = 0, transaction_nsu = ?, invoice_slug = ?, notes = ?, updated_at = ? WHERE id = ? AND status = 'pending'").bind(transactionNsu,slug,notes,now,id).run();
    return true;
  }
  await db.batch([
    ...individualItems.map((item) => db.prepare("UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?").bind(item.quantity,now,item.productId,item.quantity)),
    db.prepare("UPDATE orders SET status = 'paid', stock_deducted = 1, transaction_nsu = ?, invoice_slug = ?, updated_at = ? WHERE id = ? AND status = 'pending'").bind(transactionNsu,slug,now,id),
  ]);
  return true;
}
export async function updateOrder(id:string,status:string,trackingCode:string,trackingUrl:string,notes:string){await ensureOrders();const db=database();const allowed=["pending","paid","preparing","shipped","delivered","cancelled","refunded","checkout_failed"];if(!allowed.includes(status))return false;const current=await db.prepare("SELECT status,stock_deducted FROM orders WHERE id=?").bind(id).first<{status:string;stock_deducted:number}>();if(!current)return false;if(["cancelled","refunded"].includes(status)&&current.stock_deducted){const items=await db.prepare(`SELECT oi.product_id productId,oi.quantity,p.category FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=?`).bind(id).all<{productId:number;quantity:number;category:string}>();await db.batch([...items.results.filter(x=>x.category!=="Scoops").map(x=>db.prepare("UPDATE products SET stock=stock+?,updated_at=? WHERE id=?").bind(x.quantity,new Date().toISOString(),x.productId)),db.prepare("UPDATE orders SET status=?,tracking_code=?,tracking_url=?,notes=?,stock_deducted=0,updated_at=? WHERE id=?").bind(status,trackingCode,trackingUrl,notes,new Date().toISOString(),id)]);return true}await db.prepare("UPDATE orders SET status=?,tracking_code=?,tracking_url=?,notes=?,updated_at=? WHERE id=?").bind(status,trackingCode,trackingUrl,notes,new Date().toISOString(),id).run();return true}
export async function orderReport(){await ensureOrders();const db=database();const summary=await db.prepare(`SELECT COUNT(*) total_orders,COALESCE(SUM(CASE WHEN status IN ('paid','preparing','shipped','delivered') THEN total_cents ELSE 0 END),0) revenue_cents,COALESCE(AVG(CASE WHEN status IN ('paid','preparing','shipped','delivered') THEN total_cents END),0) average_cents FROM orders`).first<Record<string,unknown>>();const byStatus=await db.prepare("SELECT status,COUNT(*) total FROM orders GROUP BY status ORDER BY total DESC").all<Record<string,unknown>>();const top=await db.prepare(`SELECT product_name,SUM(quantity) quantity,SUM(unit_price_cents*quantity) revenue_cents FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status IN ('paid','preparing','shipped','delivered') GROUP BY product_name ORDER BY quantity DESC LIMIT 10`).all<Record<string,unknown>>();return{totalOrders:Number(summary?.total_orders||0),revenueCents:Number(summary?.revenue_cents||0),averageCents:Number(summary?.average_cents||0),byStatus:byStatus.results,topProducts:top.results}}
