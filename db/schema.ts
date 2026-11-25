import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  color: text("color").notNull().default("pink"),
  icon: text("icon").notNull().default("🍒"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  slug: text("slug").notNull().default(""),
  compareAtPrice: real("compare_at_price"),
  details: text("details").notNull().default(""),
  itemCount: text("item_count").notNull().default(""),
  experienceOptions: text("experience_options").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_products_active_sort").on(table.active, table.sortOrder), index("idx_products_slug").on(table.slug)]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), status: text("status").notNull().default("pending"),
  subtotalCents: integer("subtotal_cents").notNull(), shippingCents: integer("shipping_cents").notNull(),
  totalCents: integer("total_cents").notNull(), checkoutUrl: text("checkout_url"),
  transactionNsu: text("transaction_nsu"), invoiceSlug: text("invoice_slug"),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_orders_status_created").on(table.status, table.createdAt)]);

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement:true }), orderId: text("order_id").notNull(),
  productId: integer("product_id").notNull(), productName: text("product_name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(), quantity: integer("quantity").notNull(),
}, (table) => [index("idx_order_items_order").on(table.orderId)]);

export const siteContent = sqliteTable("site_content", {
  contentKey: text("content_key").primaryKey(),
  desktopValue: text("desktop_value").notNull(),
  mobileValue: text("mobile_value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
